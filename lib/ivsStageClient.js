// Client-side Amazon IVS Real-Time WebRTC Stage Manager
// Integrates amazon-ivs-web-broadcast with DynamoDB presence & strict participant deduplication

export class IvsStageClient {
  constructor({
    meetingId,
    userName,
    onParticipantJoined,
    onParticipantLeft,
    onStreamAdded,
    onStreamRemoved,
    onParticipantStateUpdate,
    onConnectionStateChange,
    onError
  }) {
    this.meetingId = meetingId;
    this.userName = (userName || 'Guest').trim();
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
    this.isConnected = false;

    this.heartbeatTimer = null;
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

  setupBroadcastChannel() {
    if (!this.channel) return;

    this.channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.sessionId === this.sessionId || data.userName === this.userName) return;

      const pKey = data.userName;

      switch (data.type) {
        case 'ANNOUNCE_PRESENCE':
        case 'STATE_SYNC': {
          this.onParticipantJoined({
            id: pKey,
            userId: pKey,
            userName: data.userName,
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
          });

          if (data.type === 'ANNOUNCE_PRESENCE') {
            this.broadcastState('STATE_SYNC');
          }
          break;
        }
        case 'PARTICIPANT_UPDATE': {
          this.onParticipantStateUpdate(pKey, {
            isCameraOn: Boolean(data.isCameraOn),
            isMicOn: Boolean(data.isMicOn),
            isSpeaking: Boolean(data.isSpeaking)
          });
          break;
        }
        case 'LEAVE': {
          this.onParticipantLeft(pKey);
          break;
        }
      }
    };

    setTimeout(() => {
      this.broadcastState('ANNOUNCE_PRESENCE');
    }, 150);
  }

  broadcastState(type = 'PARTICIPANT_UPDATE', extra = {}) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        type,
        sessionId: this.sessionId,
        userName: this.userName,
        isCameraOn: Boolean(this.localVideoTrack?.enabled),
        isMicOn: Boolean(this.localAudioTrack?.enabled),
        ...extra
      });
    } catch (e) {}
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
        // Sync active participants from DynamoDB, filtering out local user
        for (const p of active) {
          if (p.userName !== this.userName) {
            this.onParticipantJoined({
              id: p.userName,
              userId: p.userName,
              userName: p.userName,
              isCameraOn: p.isCameraOn,
              isMicOn: p.isMicOn,
              isSpeaking: p.isSpeaking
            });
          }
        }
      }
    } catch (e) {}
  }

  async initialize() {
    if (typeof window === 'undefined') return;

    try {
      this.onConnectionStateChange('connecting', { message: 'Requesting AWS IVS Participant Token...' });

      // Send initial presence to DynamoDB
      await this.sendPresenceHeartbeat();

      // Start periodic 5s heartbeat
      this.heartbeatTimer = setInterval(() => {
        this.sendPresenceHeartbeat();
      }, 5000);

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
        this.onParticipantJoined({
          id: pName,
          userId: pName,
          userName: pName,
          isCameraOn: false,
          isMicOn: true,
          videoTrack: null,
          audioTrack: null
        });
      });

      this.stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, (participant) => {
        const pName = participant.attributes?.userName || participant.userId || 'Guest';
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

  leave() {
    try {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
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
      if (this.channel) {
        this.channel.close();
        this.channel = null;
      }
      if (this.stage) {
        this.stage.leave();
        this.stage = null;
      }
      this.isConnected = false;
    } catch (e) {
      console.warn('Error leaving IVS stage:', e);
    }
  }
}
