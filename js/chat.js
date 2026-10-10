// In-Meeting Chat System

export class ChatSystem {
  constructor() {
    this.messages = [
      {
        id: 'msg-1',
        sender: 'Sarah Chen',
        text: 'Hey everyone! Glad to see everyone on the call.',
        time: '12:20 AM',
        isSelf: false,
        avatarColor: '#0d904f'
      },
      {
        id: 'msg-2',
        sender: 'David Miller',
        text: 'Sharing the design notes in a moment for meeting eps-kziz-mfv 🚀',
        time: '12:22 AM',
        isSelf: false,
        avatarColor: '#e37400'
      }
    ];

    this.unreadCount = 0;
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.messages, this.unreadCount));
  }

  getMessages() {
    return this.messages;
  }

  getCurrentTimeStr() {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  sendMessage(text, senderName = 'You', isSelf = true, isDrawerOpen = true) {
    if (!text || !text.trim()) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: senderName,
      text: text.trim(),
      time: this.getCurrentTimeStr(),
      isSelf,
      avatarColor: isSelf ? '#1a73e8' : '#a142f4'
    };

    this.messages.push(newMsg);

    if (!isDrawerOpen && !isSelf) {
      this.unreadCount++;
    }

    this.notify();

    // If sent by user, simulate peer response
    if (isSelf) {
      this.triggerSimulatedResponse(text);
    }
  }

  clearUnread() {
    this.unreadCount = 0;
    this.notify();
  }

  triggerSimulatedResponse(userText) {
    const responses = [
      "Thanks for sharing, Ayushmaan! That makes a lot of sense.",
      "Agreed! Let's make sure that's captured in our sprint doc.",
      "Sounds great to me. I will double check the specs.",
      "I love how smooth this meeting interface is running!",
      "Checking that right now on my end."
    ];

    setTimeout(() => {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const peers = ['Sarah Chen', 'Elena Rostova', 'David Miller'];
      const randomPeer = peers[Math.floor(Math.random() * peers.length)];
      this.sendMessage(randomResponse, randomPeer, false, false);
    }, 1800 + Math.random() * 1200);
  }
}

export const chat = new ChatSystem();
