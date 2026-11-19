// Client-side Amazon IVS Real-Time WebRTC Stage & Built-in WebRTC P2P Mesh Manager
// Provides seamless WebRTC P2P audio/video/screen sharing + AWS IVS Stage scale for 1000s of participants

export class IvsStageClient {
  constructor({
    meetingId,
    userName,
    onParticipantJoined,
    onParticipantLeft,
    onStreamAdded,
    onStreamRemoved,
    onParticipantStateUpdate,
    onPresentationChange,
    onToolEvent,
    onChatMessage,
    onConnectionStateChange,
    onError
  }) {
    this.meetingId = meetingId;
    this.userName = (userName || 'Guest').trim();
    this.knownPeers = new Set();
    this.knownPeerMeta = new Map(); // sessionId -> { userName, isCameraOn, isMicOn, isSpeaking }
    this.peerConnections = new Map(); // sessionId -> RTCPeerConnection
    this.peerSenders = new Map(); // sessionId -> { audio: RTCRtpSender, video: RTCRtpSender, screen: RTCRtpSender }

    // Stable sessionId per browser tab session
    if (typeof window !== 'undefined') {
      let sId = sessionStorage.getItem(`connectt_sid_${meetingId}`);
      if (!sId) {
        sId = `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
        sessionStorage.setItem(`connectt_sid_${meetingId}`, sId);
      }
      this.sessionId = sId;
    } else {
      this.sessionId = `sid_${Date.now().toString(36)}`;
    }

    this.onParticipantJoined = onParticipantJoined || (() => {});
    this.onParticipantLeft = onParticipantLeft || (() => {});
    this.onStreamAdded = onStreamAdded || (() => {});
    this.onStreamRemoved = onStreamRemoved || (() => {});
    this.onParticipantStateUpdate = onParticipantStateUpdate || (() => {});
    this.onPresentationChange = onPresentationChange || (() => {});
    this.onToolEvent = onToolEvent || (() => {});
    this.onChatMessage = onChatMessage || (() => {});
    this.onConnectionStateChange = onConnectionStateChange || (() => {});
    this.onError = onError || (() => {});

    this.stage = null;
    this.token = null;
    this.stageArn = null;
    this.participantId = null;
    this.isLiveAws = false;
    this.accountStatus = 'verified';

    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.localStream = null;
    this.localAudioStream = null;
    this.localVideoStream = null;
    this.localScreenStream = null;
    this.screenStream = null;
    this.isConnected = false;
    this.currentRemotePresentation = null;

    this.heartbeatTimer = null;
    this.ws = null;
    this.wsReconnectTimer = null;
    this.channel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(`connectt_meeting_${this.meetingId}`);
        this.setupBroadcastChannel();
      } catch (e) {}
    }

    // Auto-leave on window unload
    this.handleUnload = () => this.leave();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleUnload);
    }
  }

  setupWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      const loc = window.location;
      const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${loc.host}/ws?roomId=${encodeURIComponent(this.meetingId)}&userId=${encodeURIComponent(this.sessionId)}&userName=${encodeURIComponent(this.userName)}`;

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        this.ws = socket;
        this.sendWsMessage({
          type: 'HEARTBEAT',
          sessionId: this.sessionId,
          isCameraOn: Boolean(this.localVideoTrack?.enabled),
          isMicOn: Boolean(this.localAudioTrack?.enabled)
        });
        // Announce our presence to newly connected socket
        setTimeout(() => {
          this.broadcastState('ANNOUNCE_PRESENCE');
        }, 100);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleInboundSignal(data);
        } catch (e) {}
      };

      socket.onclose = () => {
        this.ws = null;
        if (this.isConnected && !this.wsReconnectTimer) {
          this.wsReconnectTimer = setTimeout(() => {
            this.wsReconnectTimer = null;
            this.setupWebSocket();
          }, 2500);
        }
      };

      socket.onerror = () => {};
    } catch (e) {}
  }

  sendWsMessage(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          roomId: this.meetingId,
          sessionId: this.sessionId,
          userId: this.sessionId,
          userName: this.userName,
          ...msg
        }));
        return true;
      } catch (e) {}
    }
    return false;
  }

  sendSignalingMessage(payload) {
    const fullPayload = {
      ...payload,
      senderSessionId: this.sessionId,
      senderUserName: this.userName,
      roomId: this.meetingId,
      timestamp: Date.now()
    };
    this.sendWsMessage(fullPayload);
    if (this.channel) {
      try {
        this.channel.postMessage(fullPayload);
      } catch (e) {}
    }
  }

  // ── WebRTC PeerConnection Mesh Engine ──────────────────────────────────────
  getOrCreatePeerConnection(remoteSessionId, remoteUserName = 'Participant') {
    if (this.peerConnections.has(remoteSessionId)) {
      return this.peerConnections.get(remoteSessionId);
    }

    if (remoteUserName) {
      this.knownPeerMeta.set(remoteSessionId, {
        ...(this.knownPeerMeta.get(remoteSessionId) || {}),
        userName: remoteUserName
      });
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    this.peerConnections.set(remoteSessionId, pc);
    const senders = { audio: null, video: null, screen: null };
    this.peerSenders.set(remoteSessionId, senders);

    // Attach local audio & video if active
    try {
      if (this.localAudioTrack) {
        senders.audio = pc.addTrack(this.localAudioTrack, new MediaStream([this.localAudioTrack]));
      }
      if (this.localVideoTrack) {
        senders.video = pc.addTrack(this.localVideoTrack, new MediaStream([this.localVideoTrack]));
      }
      if (this.screenStream) {
        const screenTrack = this.screenStream.getVideoTracks()[0];
        if (screenTrack) {
          senders.screen = pc.addTrack(screenTrack, this.screenStream);
        }
      }
    } catch (e) {
      console.warn('[WebRTC P2P] Track attach error:', e);
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'RTC_ICE',
          targetSessionId: remoteSessionId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const track = event.track;
      const stream = event.streams[0] || new MediaStream([track]);
      const meta = this.knownPeerMeta.get(remoteSessionId) || {};
      const pName = meta.userName || remoteUserName || remoteSessionId;

      const isScreen = (track.label && track.label.toLowerCase().includes('screen')) ||
                       (this.currentRemotePresentation?.active && this.currentRemotePresentation?.mode === 'screen');

      if (track.kind === 'video') {
        if (isScreen) {
          this.onStreamAdded(pName, {
            id: pName,
            sessionId: remoteSessionId,
            userName: pName,
            screenTrack: track,
            screenStream: stream,
            videoTrack: track
          });
        } else {
          this.onStreamAdded(pName, {
            id: pName,
            sessionId: remoteSessionId,
            userName: pName,
            videoTrack: track,
            stream: stream,
            isCameraOn: true
          });
        }
      } else if (track.kind === 'audio') {
        this.onStreamAdded(pName, {
          id: pName,
          sessionId: remoteSessionId,
          userName: pName,
          audioTrack: track,
          isMicOn: true
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.peerConnections.delete(remoteSessionId);
        this.peerSenders.delete(remoteSessionId);
      }
    };

    return pc;
  }

  async initiatePeerOffer(remoteSessionId, remoteUserName) {
    try {
      const pc = this.getOrCreatePeerConnection(remoteSessionId, remoteUserName);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.sendSignalingMessage({
        type: 'RTC_OFFER',
        targetSessionId: remoteSessionId,
        sdp: offer
      });
    } catch (err) {
      console.warn('[WebRTC P2P] initiatePeerOffer error:', err);
    }
  }

  handleInboundSignal(data) {
    if (!data) return;

    // Discard our own messages by unique sessionId
    if (data.sessionId && data.sessionId === this.sessionId) return;
    if (data.senderSessionId && data.senderSessionId === this.sessionId) return;

    const senderSid = data.sessionId || data.senderSessionId || data.userId;
    const pKey = data.userName || data.senderUserName || senderSid;
    if (!pKey && !senderSid) return;

    switch (data.type) {
      case 'ROSTER': {
        const list = data.participants || [];
        for (const p of list) {
          const peerSid = p.userId || p.sessionId;
          const peerName = p.userName || 'Participant';
          if (peerSid !== this.sessionId) {
            if (!this.knownPeers.has(peerName)) {
              this.knownPeers.add(peerName);
              this.knownPeerMeta.set(peerSid, { userName: peerName });
              this.onParticipantJoined({
                id: peerName,
                userId: peerSid,
                sessionId: peerSid,
                userName: peerName,
                isCameraOn: Boolean(p.isCameraOn),
                isMicOn: Boolean(p.isMicOn),
                isSpeaking: Boolean(p.isSpeaking)
              });
            }
            // Deterministic initiator: lexicographically smaller initiates WebRTC offer
            if (this.sessionId < peerSid) {
              this.initiatePeerOffer(peerSid, peerName).catch(() => {});
            }
          }
        }
        if (data.presentation) {
          this.currentRemotePresentation = data.presentation;
          this.onPresentationChange(data.presentation);
        }
        break;
      }

      case 'PARTICIPANT_JOINED':
      case 'ANNOUNCE_PRESENCE': {
        if (!this.knownPeers.has(pKey)) {
          this.knownPeers.add(pKey);
          if (senderSid) this.knownPeerMeta.set(senderSid, { userName: pKey });
          this.onParticipantJoined({
            id: pKey,
            userId: senderSid || pKey,
            sessionId: senderSid,
            userName: pKey,
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
          });
          if (data.type === 'ANNOUNCE_PRESENCE') {
            this.broadcastState('STATE_SYNC');
          }
        }
        // Negotiate WebRTC P2P
        if (senderSid && this.sessionId < senderSid) {
          this.initiatePeerOffer(senderSid, pKey).catch(() => {});
        }
        break;
      }

      case 'PARTICIPANT_UPDATE':
      case 'STATE_SYNC': {
        if (!this.knownPeers.has(pKey)) {
          this.knownPeers.add(pKey);
          if (senderSid) this.knownPeerMeta.set(senderSid, { userName: pKey });
          this.onParticipantJoined({
            id: pKey,
            userId: senderSid || pKey,
            sessionId: senderSid,
            userName: pKey,
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
          });
        } else {
          this.onParticipantStateUpdate(pKey, {
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking),
            isHandRaised: Boolean(data.isHandRaised)
          });
        }
        break;
      }

      case 'PARTICIPANT_LEFT':
      case 'LEAVE': {
        if (this.knownPeers.has(pKey)) {
          this.knownPeers.delete(pKey);
          this.onParticipantLeft(pKey);
        }
        if (senderSid) {
          const pc = this.peerConnections.get(senderSid);
          if (pc) {
            pc.close();
            this.peerConnections.delete(senderSid);
            this.peerSenders.delete(senderSid);
            this.knownPeerMeta.delete(senderSid);
          }
        }
        break;
      }

      case 'PRESENTATION_START':
      case 'PRESENTATION_STOP':
      case 'PRESENTATION_UPDATE': {
        this.currentRemotePresentation = data;
        this.onPresentationChange(data);
        break;
      }

      case 'TOOL_SYNC':
      case 'WHITEBOARD_DRAW': {
        this.onToolEvent(data);
        break;
      }

      case 'CHAT': {
        this.onChatMessage(data);
        break;
      }

      case 'HOST_CONTROL': {
        this.onParticipantStateUpdate('__host__', data);
        break;
      }

      // ── WebRTC Signaling ───────────────────────────────────────────────────
      case 'RTC_OFFER': {
        if (data.targetSessionId && data.targetSessionId !== this.sessionId) return;
        const fromSid = data.senderSessionId;
        if (!fromSid) return;
        const pc = this.getOrCreatePeerConnection(fromSid, data.senderUserName);
        (async () => {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.sendSignalingMessage({
              type: 'RTC_ANSWER',
              targetSessionId: fromSid,
              sdp: answer
            });
          } catch (e) {
            console.warn('[WebRTC P2P] RTC_OFFER error:', e);
          }
        })();
        break;
      }

      case 'RTC_ANSWER': {
        if (data.targetSessionId && data.targetSessionId !== this.sessionId) return;
        const fromSid = data.senderSessionId;
        const pc = this.peerConnections.get(fromSid);
        if (pc && pc.signalingState === 'have-local-offer') {
          pc.setRemoteDescription(new RTCSessionDescription(data.sdp)).catch((e) => {
            console.warn('[WebRTC P2P] RTC_ANSWER error:', e);
          });
        }
        break;
      }

      case 'RTC_ICE': {
        if (data.targetSessionId && data.targetSessionId !== this.sessionId) return;
        const fromSid = data.senderSessionId;
        const pc = this.peerConnections.get(fromSid);
        if (pc && pc.remoteDescription && data.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
        }
        break;
      }
    }
  }

  setupBroadcastChannel() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.sessionId === this.sessionId) return;
      this.handleInboundSignal(data);
    };

    setTimeout(() => {
      this.broadcastState('ANNOUNCE_PRESENCE');
    }, 200);
  }

  broadcastState(type = 'PARTICIPANT_UPDATE', extra = {}) {
    const payload = {
      type,
      sessionId: this.sessionId,
      userName: this.userName,
      isCameraOn: Boolean(this.localVideoTrack?.enabled),
      isMicOn: Boolean(this.localAudioTrack?.enabled),
      ...extra
    };

    this.sendWsMessage(payload);
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {}
    }
  }

  broadcastPresentation(mode, extra = {}) {
    const payload = {
      type: mode ? 'PRESENTATION_START' : 'PRESENTATION_STOP',
      mode,
      presenter: this.userName,
      active: Boolean(mode),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      ...extra
    };

    this.sendWsMessage(payload);
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {}
    }
  }

  broadcastToolSync(toolType, action, payload = {}) {
    const data = {
      type: 'TOOL_SYNC',
      toolType,
      action,
      payload,
      userName: this.userName,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
    this.sendWsMessage(data);
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch (e) {}
    }
  }

  broadcastHostControl(controls = {}) {
    const data = {
      type: 'HOST_CONTROL',
      ...controls,
      hostName: this.userName,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
    this.sendWsMessage(data);
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch (e) {}
    }
  }

  async sendPresenceHeartbeat() {
    if (!this.meetingId || !this.userName) return;
    try {
      const res = await fetch(`/api/room/${this.meetingId}/presence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.sessionId,
          userName: this.userName,
          action: 'heartbeat',
          isCameraOn: Boolean(this.localVideoTrack?.enabled),
          isMicOn: Boolean(this.localAudioTrack?.enabled)
        })
      });

      if (res.ok) {
        const data = await res.json();
        const active = data.activeParticipants || [];
        const activeUserNames = new Set();

        for (const p of active) {
          if (p.userName !== this.userName) {
            activeUserNames.add(p.userName);

            if (!this.knownPeers.has(p.userName)) {
              this.knownPeers.add(p.userName);
              this.onParticipantJoined({
                id: p.userName,
                userId: p.userId || p.userName,
                userName: p.userName,
                isCameraOn: p.isCameraOn,
                isMicOn: p.isMicOn,
                isSpeaking: p.isSpeaking
              });
            } else {
              this.onParticipantStateUpdate(p.userName, {
                isCameraOn: p.isCameraOn,
                isMicOn: p.isMicOn,
                isSpeaking: p.isSpeaking
              });
            }
          }
        }

        for (const known of Array.from(this.knownPeers)) {
          if (!activeUserNames.has(known)) {
            this.knownPeers.delete(known);
            this.onParticipantLeft(known);
          }
        }
      }
    } catch (e) {}
  }

  async initialize() {
    if (typeof window === 'undefined') return;

    try {
      this.onConnectionStateChange('connecting', { message: 'Initializing real-time signaling...' });

      // Start WebSocket connection
      this.setupWebSocket();

      // Send initial presence to DynamoDB
      await this.sendPresenceHeartbeat();

      // Start periodic 7s heartbeat
      this.heartbeatTimer = setInterval(() => {
        this.sendPresenceHeartbeat();
      }, 7000);

      // Attempt AWS IVS Stage initialization for enterprise scaling
      try {
        const res = await fetch('/api/ivs/stage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId: this.meetingId,
            userName: this.userName
          })
        });

        if (res.ok) {
          const data = await res.json();
          this.token = data.token;
          this.stageArn = data.stageArn;
          this.participantId = data.participantId;
          this.isLiveAws = Boolean(data.isLiveAws);
          this.accountStatus = data.accountStatus;

          if (this.isLiveAws && this.token && !this.token.startsWith('fallback.')) {
            await this.connectLiveStage();
          }
        }
      } catch (awsErr) {
        console.info('[IVS Stage] Using built-in WebRTC P2P Mesh engine.');
      }

      this.isConnected = true;
      this.onConnectionStateChange('connected', {
        isLiveAws: this.isLiveAws,
        accountStatus: this.accountStatus,
        stageArn: this.stageArn,
        participantId: this.participantId
      });

      return { success: true };
    } catch (err) {
      console.error('[Client Init Error]:', err);
      this.onError(err);
      this.onConnectionStateChange('error', { error: err.message });
      throw err;
    }
  }

  async connectLiveStage() {
    try {
      const IVSBroadcast = await import('amazon-ivs-web-broadcast');
      const { Stage, LocalStageStream, SubscribeType, StageEvents, ConnectionState } = IVSBroadcast;

      const self = this;
      const strategy = {
        stageStreamsToPublish() {
          const streams = [];
          if (self.localAudioStream) streams.push(self.localAudioStream);
          if (self.localVideoStream) streams.push(self.localVideoStream);
          if (self.localScreenStream) streams.push(self.localScreenStream);
          return streams;
        },
        shouldPublishParticipant() {
          return true;
        },
        shouldSubscribeToParticipant() {
          return SubscribeType.AUDIO_VIDEO;
        }
      };

      this.stage = new Stage(this.token, strategy);

      this.stage.on(StageEvents.STAGE_CONNECTION_STATE_CHANGED, (state) => {
        const isConn = state === ConnectionState.CONNECTED;
        this.isConnected = isConn;
        this.onConnectionStateChange(isConn ? 'connected' : 'connecting', {
          isLiveAws: true,
          stageArn: this.stageArn,
          participantId: this.participantId
        });
      });

      this.stage.on(StageEvents.STAGE_PARTICIPANT_JOINED, (participant) => {
        const pName = participant.attributes?.userName || participant.userId || 'Guest';
        if (pName !== self.userName) {
          self.knownPeers.add(pName);
          this.onParticipantJoined({
            id: pName,
            userId: participant.userId,
            userName: pName,
            isCameraOn: false,
            isMicOn: false,
            videoTrack: null,
            audioTrack: null
          });
        }
      });

      this.stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, (participant) => {
        const pName = participant.attributes?.userName || participant.userId || 'Guest';
        self.knownPeers.delete(pName);
        this.onParticipantLeft(pName);
      });

      this.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
        const pName = participant.attributes?.userName || participant.userId || 'Guest';
        if (pName === self.userName) return;

        let videoTrack = null;
        let audioTrack = null;
        for (const s of streams) {
          if (s.streamType === 'video') videoTrack = s.mediaStreamTrack;
          if (s.streamType === 'audio') audioTrack = s.mediaStreamTrack;
        }

        this.onStreamAdded(pName, {
          id: pName,
          userId: pName,
          userName: pName,
          videoTrack,
          audioTrack,
          isCameraOn: Boolean(videoTrack),
          isMicOn: Boolean(audioTrack)
        });
      });

      this.stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, (participant) => {
        const pName = participant.attributes?.userName || participant.userId || 'Guest';
        this.onStreamRemoved(pName);
      });

      await this.stage.join();
    } catch (err) {
      console.warn('[AWS IVS Stage Live Connect Fallback]:', err);
      this.isConnected = true;
    }
  }

  async updateLocalMedia(stream, isCameraOn, isMicOn, isSpeaking = false) {
    if (!stream) return;

    try {
      this.localStream = stream;
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      if (audioTrack) {
        this.localAudioTrack = audioTrack;
        audioTrack.enabled = Boolean(isMicOn);
      }
      if (videoTrack) {
        this.localVideoTrack = videoTrack;
        videoTrack.enabled = Boolean(isCameraOn);
      }

      this.broadcastState('PARTICIPANT_UPDATE', {
        isCameraOn,
        isMicOn,
        isSpeaking
      });

      // Update WebRTC P2P senders across all active peer connections
      for (const [sid, pc] of this.peerConnections.entries()) {
        const senders = this.peerSenders.get(sid) || {};
        try {
          if (audioTrack) {
            if (senders.audio) {
              senders.audio.replaceTrack(isMicOn ? audioTrack : null).catch(() => {});
            } else if (isMicOn) {
              senders.audio = pc.addTrack(audioTrack, stream);
            }
          }
          if (videoTrack) {
            if (senders.video) {
              senders.video.replaceTrack(isCameraOn ? videoTrack : null).catch(() => {});
            } else if (isCameraOn) {
              senders.video = pc.addTrack(videoTrack, stream);
            }
          }
        } catch (e) {}
      }

      // AWS IVS Stage update if live
      if (this.stage && this.isLiveAws) {
        const IVSBroadcast = await import('amazon-ivs-web-broadcast');
        const { LocalStageStream } = IVSBroadcast;
        this.localAudioStream = (this.localAudioTrack && isMicOn) ? new LocalStageStream(this.localAudioTrack) : null;
        this.localVideoStream = (this.localVideoTrack && isCameraOn) ? new LocalStageStream(this.localVideoTrack) : null;
        this.stage.refreshStrategy();
      }
    } catch (e) {
      console.warn('Could not update local streams:', e);
    }
  }

  async publishScreenShare(displayStream) {
    this.screenStream = displayStream;

    if (displayStream) {
      const screenTrack = displayStream.getVideoTracks()[0];

      // Broadcast screen track to all WebRTC peers
      for (const [sid, pc] of this.peerConnections.entries()) {
        const senders = this.peerSenders.get(sid) || {};
        try {
          if (senders.screen) {
            senders.screen.replaceTrack(screenTrack).catch(() => {});
          } else if (screenTrack) {
            senders.screen = pc.addTrack(screenTrack, displayStream);
            // Re-negotiate offer with screen track
            this.initiatePeerOffer(sid, this.knownPeerMeta.get(sid)?.userName).catch(() => {});
          }
        } catch (e) {
          console.warn('Error publishing screen track to peer:', e);
        }
      }

      // AWS IVS Stage screen publishing if live
      if (this.stage && this.isLiveAws && screenTrack) {
        try {
          const IVSBroadcast = await import('amazon-ivs-web-broadcast');
          const { LocalStageStream } = IVSBroadcast;
          this.localScreenStream = new LocalStageStream(screenTrack);
          this.stage.refreshStrategy();
        } catch (e) {}
      }

      this.broadcastPresentation('screen', { presenter: this.userName, active: true });
    } else {
      // Screen share stopped
      for (const [sid, pc] of this.peerConnections.entries()) {
        const senders = this.peerSenders.get(sid) || {};
        try {
          if (senders.screen) {
            pc.removeTrack(senders.screen);
            senders.screen = null;
          }
        } catch (e) {}
      }

      if (this.stage && this.isLiveAws && this.localScreenStream) {
        this.localScreenStream = null;
        this.stage.refreshStrategy();
      }

      this.broadcastPresentation(null, { presenter: this.userName, active: false });
    }
  }

  leave() {
    try {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      if (this.wsReconnectTimer) {
        clearTimeout(this.wsReconnectTimer);
        this.wsReconnectTimer = null;
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', this.handleUnload);

        fetch(`/api/room/${this.meetingId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.sessionId,
            userName: this.userName,
            action: 'leave'
          }),
          keepalive: true
        }).catch(() => {});
      }

      this.broadcastState('LEAVE');

      // Close all WebRTC peer connections
      for (const pc of this.peerConnections.values()) {
        try { pc.close(); } catch (e) {}
      }
      this.peerConnections.clear();
      this.peerSenders.clear();
      this.knownPeerMeta.clear();

      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      if (this.channel) {
        this.channel.close();
        this.channel = null;
      }
      if (this.stage) {
        this.stage.leave();
        this.stage = null;
      }
      this.isConnected = false;
      this.knownPeers.clear();
    } catch (e) {
      console.warn('Error leaving stage:', e);
    }
  }
}
