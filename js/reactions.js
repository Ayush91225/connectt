// Google Meet Floating Emoji Reaction System
import { sfx } from './audio-sfx.js';

export class ReactionSystem {
  constructor() {
    this.container = null;
    this.availableEmojis = ['👍', '❤️', '👏', '😂', '😮', '😢', '🎉', '🔥'];
    this.peerReactionInterval = null;
  }

  init(containerElement) {
    this.container = containerElement;
  }

  spawnReaction(emoji, originX = null, originY = null, senderName = null) {
    if (!this.container) return;
    sfx.playReaction();

    const reactionEl = document.createElement('div');
    reactionEl.className = 'floating-reaction';

    // Position
    const containerRect = this.container.getBoundingClientRect();
    const x = originX !== null ? originX : containerRect.width * (0.2 + Math.random() * 0.6);
    const y = originY !== null ? originY : containerRect.height - 120;

    reactionEl.style.left = `${x}px`;
    reactionEl.style.top = `${y}px`;

    // Drift trajectory
    const driftX = (Math.random() - 0.5) * 80;
    const rotate = (Math.random() - 0.5) * 40;
    reactionEl.style.setProperty('--drift-x', `${driftX}px`);
    reactionEl.style.setProperty('--rotate-deg', `${rotate}deg`);

    if (senderName) {
      reactionEl.innerHTML = `
        <div class="reaction-bubble">
          <span class="emoji">${emoji}</span>
          <span class="reaction-sender">${senderName}</span>
        </div>
      `;
    } else {
      reactionEl.innerHTML = `
        <div class="reaction-bubble solo">
          <span class="emoji">${emoji}</span>
        </div>
      `;
    }

    this.container.appendChild(reactionEl);

    // Remove after animation completes (2.5s)
    setTimeout(() => {
      if (reactionEl.parentNode) {
        reactionEl.parentNode.removeChild(reactionEl);
      }
    }, 2500);
  }

  startPeerReactions(participantsGetter) {
    if (this.peerReactionInterval) return;

    this.peerReactionInterval = setInterval(() => {
      // 30% chance every 4s that a peer reacts
      if (Math.random() < 0.35) {
        const participants = participantsGetter().filter(p => !p.isSelf);
        if (participants.length > 0) {
          const randomPeer = participants[Math.floor(Math.random() * participants.length)];
          const randomEmoji = this.availableEmojis[Math.floor(Math.random() * this.availableEmojis.length)];
          this.spawnReaction(randomEmoji, null, null, randomPeer.name);
        }
      }
    }, 4500);
  }

  stopPeerReactions() {
    if (this.peerReactionInterval) {
      clearInterval(this.peerReactionInterval);
      this.peerReactionInterval = null;
    }
  }
}

export const reactions = new ReactionSystem();
