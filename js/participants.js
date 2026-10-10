// Participant Management and Interactive Peer Simulator

export class ParticipantManager {
  constructor() {
    this.participants = [
      {
        id: 'self',
        name: 'Ayushmaan Soni',
        isSelf: true,
        isHost: true,
        isMuted: false,
        isVideoOn: true,
        isHandRaised: false,
        isPinned: false,
        avatarColor: '#1a73e8',
        role: 'Meeting host',
        isSpeaking: false,
        volume: 0
      },
      {
        id: 'peer-1',
        name: 'Sarah Chen',
        isSelf: false,
        isHost: false,
        isMuted: false,
        isVideoOn: true,
        isHandRaised: false,
        isPinned: false,
        avatarColor: '#0d904f',
        role: 'Software Engineer',
        isSpeaking: false,
        videoPlaceholder: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=80',
        volume: 0
      },
      {
        id: 'peer-2',
        name: 'David Miller',
        isSelf: false,
        isHost: false,
        isMuted: true,
        isVideoOn: false,
        isHandRaised: false,
        isPinned: false,
        avatarColor: '#e37400',
        role: 'Product Manager',
        isSpeaking: false,
        volume: 0
      },
      {
        id: 'peer-3',
        name: 'Elena Rostova',
        isSelf: false,
        isHost: false,
        isMuted: false,
        isVideoOn: true,
        isHandRaised: false,
        isPinned: false,
        avatarColor: '#a142f4',
        role: 'UX Designer',
        isSpeaking: false,
        videoPlaceholder: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80',
        volume: 0
      }
    ];

    this.listeners = [];
    this.simulationInterval = null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.participants));
  }

  getParticipants() {
    return this.participants;
  }

  getSelf() {
    return this.participants.find(p => p.isSelf);
  }

  updateSelf(updates) {
    const self = this.getSelf();
    if (self) {
      Object.assign(self, updates);
      this.notify();
    }
  }

  togglePin(id) {
    const p = this.participants.find(item => item.id === id);
    if (p) {
      const willPin = !p.isPinned;
      // unpin others if we only allow single pin, or pin/unpin
      this.participants.forEach(item => { item.isPinned = false; });
      p.isPinned = willPin;
      this.notify();
    }
  }

  togglePeerMute(id) {
    const p = this.participants.find(item => item.id === id);
    if (p && !p.isSelf) {
      p.isMuted = !p.isMuted;
      if (p.isMuted) p.isSpeaking = false;
      this.notify();
    }
  }

  removePeer(id) {
    this.participants = this.participants.filter(p => p.id !== id);
    this.notify();
  }

  addPeer(name, role = 'Participant') {
    const colors = ['#ea4335', '#4285f4', '#34a853', '#fbbc05', '#ff6d00', '#9c27b0'];
    const newPeer = {
      id: 'peer-' + Date.now(),
      name,
      isSelf: false,
      isHost: false,
      isMuted: false,
      isVideoOn: Math.random() > 0.3,
      isHandRaised: false,
      isPinned: false,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      role,
      isSpeaking: false,
      volume: 0
    };
    this.participants.push(newPeer);
    this.notify();
    return newPeer;
  }

  startSimulation() {
    if (this.simulationInterval) return;

    // Simulate realistic conversation turns among peers
    this.simulationInterval = setInterval(() => {
      const peers = this.participants.filter(p => !p.isSelf && !p.isMuted);
      if (peers.length === 0) return;

      // Random chance of speaking
      const speakerIndex = Math.floor(Math.random() * (peers.length + 2));
      peers.forEach((peer, idx) => {
        if (idx === speakerIndex) {
          peer.isSpeaking = true;
          peer.volume = 55 + Math.floor(Math.random() * 40);
        } else {
          peer.isSpeaking = false;
          peer.volume = 0;
        }
      });

      this.notify();
    }, 2800);
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const participantManager = new ParticipantManager();
