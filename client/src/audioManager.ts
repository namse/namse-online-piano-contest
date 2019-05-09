import { addKeyHandler } from "./setUpKeyboard";


function convertBase64ToArrayBuffer(base64: string) {
  const binary_string =  window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array( len );
  for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

type Audio = {
  note: string,
  audioBuffer: AudioBuffer,
  gainNode: GainNode,
}

class AudioManager {
  private audios: Audio[]
  private lastBufferSources: { [stepIndex: number]: AudioBufferSourceNode } = {};
  private static releaseTime: number = 0.75;
  private audioContext: AudioContext;
  private globalGainNode: GainNode;

  async initialize() {
    this.audioContext = new AudioContext();
    this.globalGainNode = this.audioContext.createGain();
    this.globalGainNode.gain.value = 3.0;
    this.globalGainNode.connect(this.audioContext.destination);
    const response = await fetch('public/note.json');
    const notes: {[key: string]: string} = await response.json();

    this.audios = await Promise.all(Object.entries(notes)
      .map(async ([note, soundBase64]) => {
        const soundArrayBuffer = convertBase64ToArrayBuffer(soundBase64);
        const audioBuffer = await this.audioContext.decodeAudioData(soundArrayBuffer);

        const gainNode = this.audioContext.createGain();
        gainNode.connect(this.globalGainNode);

        return {
          note,
          audioBuffer,
          gainNode,
        };
      }));

    addKeyHandler((stepIndex: number, isKeyDown: boolean) => {
      if (isKeyDown) {
        this.play(stepIndex);
      } else {
        this.stop(stepIndex);
      }
    });
  }

  play(stepIndex: number) {
    const audio = this.audios[stepIndex];
    if (!audio) {
      return;
    }

    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = audio.audioBuffer;
    bufferSource.connect(audio.gainNode);
    audio.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime)
    audio.gainNode.gain.value = 1.0;

    bufferSource.start();

    this.lastBufferSources[stepIndex] = bufferSource;
  }
  stop(stepIndex: number) {
    const bufferSource = this.lastBufferSources[stepIndex];
    if (!bufferSource) {
      return;
    }
    const {
      note,
      gainNode
    } = this.audios[stepIndex];
    gainNode.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + AudioManager.releaseTime);
  }
}

const audioManager = new AudioManager();
export default audioManager;
