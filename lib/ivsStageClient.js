// Client-side Amazon IVS Real-Time WebRTC Stage & Go Orchestrator Manager
// Integrates Go Orchestrator WebSocket, AWS IVS Real-Time Stage, and DynamoDB presence

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

    // Use stable sessionId per browser tab session
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
    this.localAudioStream = null;
    this.localVideoStream = null;
    this.localScreenStream = null;
    this.isConnected = false;

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
      // Connect to orchestrator WebSocket endpoint
      const wsUrl = `${proto}//${loc.host}/ws?roomId=${encodeURIComponent(this.meetingId)}&userId=${encodeURIComponent(this.userName)}&userName=${encodeURIComponent(this.userName)}`;

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        this.ws = socket;
        this.sendWsMessage({
          type: 'HEARTBEAT',
          isCameraOn: Boolean(this.localVideoTrack?.enabled),
          isMicOn: Boolean(this.localAudioTrack?.enabled)
        });
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleInboundSignal(data);
        } catch (e) {}
      };

      socket.onclose = () => {
        this.ws = null;
        // Reconnect after 3s if still connected
        if (this.isConnected && !this.wsReconnectTimer) {
          this.wsReconnectTimer = setTimeout(() => {
            this.wsReconnectTimer = null;
            this.setupWebSocket();
          }, 3000);
        }
      };

      socket.onerror = () => {
        // Will close and reconnect cleanly
      };
    } catch (e) {}
  }

  sendWsMessage(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          roomId: this.meetingId,
          userId: this.userName,
          userName: this.userName,
          ...msg
        }));
        return true;
      } catch (e) {}
    }
    return false;
  }

  handleInboundSignal(data) {
    if (!data || data.userName === this.userName) return;

    const pKey = data.userName || data.userId;
    if (!pKey) return;

    switch (data.type) {
      case 'ROSTER': {
        const list = data.participants || [];
        for (const p of list) {
          if (p.userName && p.userName !== this.userName) {
            if (!this.knownPeers.has(p.userName)) {
              this.knownPeers.add(p.userName);
              this.onParticipantJoined({
                id: p.userName,
                userId: p.userName,
                userName: p.userName,
                isCameraOn: Boolean(p.isCameraOn),
                isMicOn: Boolean(p.isMicOn),
                isSpeaking: Boolean(p.isSpeaking)
              });
            }
          }
        }
        if (data.presentation) {
          this.onPresentationChange(data.presentation);
        }
        break;
      }

      case 'PARTICIPANT_JOINED':
      case 'ANNOUNCE_PRESENCE': {
        if (!this.knownPeers.has(pKey)) {
          this.knownPeers.add(pKey);
          this.onParticipantJoined({
            id: pKey,
            userId: pKey,
            userName: data.userName || pKey,
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
          });
          if (data.type === 'ANNOUNCE_PRESENCE') {
            this.broadcastState('STATE_SYNC');
          }
        }
        break;
      }

      case 'PARTICIPANT_UPDATE':
      case 'STATE_SYNC': {
        if (!this.knownPeers.has(pKey)) {
          this.knownPeers.add(pKey);
          this.onParticipantJoined({
            id: pKey,
            userId: pKey,
            userName: data.userName || pKey,
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
          });
        } else {
          this.onParticipantStateUpdate(pKey, {
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
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
        break;
      }

      case 'PRESENTATION_START':
      case 'PRESENTATION_STOP':
      case 'PRESENTATION_UPDATE': {
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
    }
  }

  setupBroadcastChannel() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.sessionId === this.sessionId || data.userName === this.userName) return;
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

    // Send via WebSocket first
    const sentWs = this.sendWsMessage(payload);

    // Fallback/parallel to BroadcastChannel for multi-tab
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
          userId: this.userName,
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

        // Sync active participants from DynamoDB without repeated join SFX
        for (const p of active) {
          if (p.userName !== this.userName) {
            activeUserNames.add(p.userName);

            if (!this.knownPeers.has(p.userName)) {
              this.knownPeers.add(p.userName);
              this.onParticipantJoined({
                id: p.userName,
                userId: p.userName,
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

        // Clean up participants no longer in active list
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
      this.onConnectionStateChange('connecting', { message: 'Requesting AWS IVS Participant Token...' });

      // Start WebSocket to Go Orchestrator
      this.setupWebSocket();

      // Send initial presence to DynamoDB
      await this.sendPresenceHeartbeat();

      // Start periodic 7s heartbeat
      this.heartbeatTimer = setInterval(() => {
        this.sendPresenceHeartbeat();
      }, 7000);

      // 1. Fetch AWS IVS Stage & Participant Token from backend
      const res = await fetch('/api/ivs/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: this.meetingId,
          userName: this.userName
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to request IVS stage: ${res.statusText}`);
      }

      const data = await res.json();
      this.token = data.token;
      this.stageArn = data.stageArn;
      this.participantId = data.participantId;
      this.isLiveAws = data.isLiveAws;
      this.accountStatus = data.accountStatus;

      // 2. If AWS returned a live stage token, initialize amazon-ivs-web-broadcast
      if (this.isLiveAws && this.token && !this.token.startsWith('fallback.')) {
        await this.connectLiveStage();
      } else {
        this.isConnected = true;
        this.onConnectionStateChange('connected', {
          isLiveAws: false,
          accountStatus: this.accountStatus,
          stageArn: this.stageArn,
          participantId: this.participantId
        });
      }

      return data;
    } catch (err) {
      console.error('[IVS Client Init Error]:', err);
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
        this.onConnectionStateChange(state, {
          isLiveAws: true,
          stageArn: this.stageArn,
          participantId: this.participantId
        });
      });

      this.stage.on(StageEvents.STAGE_PARTICIPANT_JOINED, (participant) => {
        const pName = participant.attributes?.userName || participant.userId || 'Guest';
        if (pName === self.userName) return; // Ignore self reflection
        if (!self.knownPeers.has(pName)) {
          self.knownPeers.add(pName);
          this.onParticipantJoined({
            id: pName,
            userId: pName,
            userName: pName,
            isCameraOn: false,
            isMicOn: true,
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
      this.onConnectionStateChange('connected', {
        isLiveAws: false,
        fallback: true
      });
    }
  }

  async updateLocalMedia(stream, isCameraOn, isMicOn, isSpeaking = false) {
    if (!stream) return;

    try {
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

      if (this.stage && this.isLiveAws) {
        const IVSBroadcast = await import('amazon-ivs-web-broadcast');
        const { LocalStageStream } = IVSBroadcast;

        this.localAudioStream = (this.localAudioTrack && isMicOn) ? new LocalStageStream(this.localAudioTrack) : null;
        this.localVideoStream = (this.localVideoTrack && isCameraOn) ? new LocalStageStream(this.localVideoTrack) : null;

        this.stage.refreshStrategy();
      }
    } catch (e) {
      console.warn('Could not update IVS local streams:', e);
    }
  }

  async publishScreenShare(displayStream) {
    this.screenStream = displayStream;
    if (displayStream) {
      const screenTrack = displayStream.getVideoTracks()[0];
      if (this.stage && this.isLiveAws && screenTrack) {
        try {
          const IVSBroadcast = await import('amazon-ivs-web-broadcast');
          const { LocalStageStream } = IVSBroadcast;
          this.localScreenStream = new LocalStageStream(screenTrack);
          this.stage.refreshStrategy();
        } catch (e) {
          console.warn('Could not publish IVS screen stream:', e);
        }
      }
      this.broadcastPresentation('screen', { presenter: this.userName, active: true });
    } else {
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

        // Tell DynamoDB we left
        fetch(`/api/room/${this.meetingId}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.userName,
            action: 'leave'
          }),
          keepalive: true
        }).catch(() => {});
      }

      this.broadcastState('LEAVE');
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
      console.warn('Error leaving IVS stage:', e);
    }
  }
}
