const audioContext = new AudioContext();
const globalGainNode = audioContext.createGain();
globalGainNode.gain.value = 3.0;
globalGainNode.connect(audioContext.destination);

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

  async initialize() {
    const response = await fetch('note.json');
    const notes: {[key: string]: string} = await response.json();

    this.audios = await Promise.all(Object.entries(notes)
      .map(async ([note, soundBase64]) => {
        const soundArrayBuffer = convertBase64ToArrayBuffer(soundBase64);
        const audioBuffer = await audioContext.decodeAudioData(soundArrayBuffer);

        const gainNode = audioContext.createGain();
        gainNode.connect(globalGainNode);

        return {
          note,
          audioBuffer,
          gainNode,
        };
      }));
    console.log(this.audios);
  }

  play(stepIndex: number) {
    const audio = this.audios[stepIndex];
    if (!audio) {
      return;
    }

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audio.audioBuffer;
    bufferSource.connect(audio.gainNode);
    audio.gainNode.gain.cancelScheduledValues(audioContext.currentTime)
    audio.gainNode.gain.value = 1.0;

    console.log(`play ${stepIndex}, ${audio.note}`);
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
    console.log(audioContext.currentTime, audioContext.currentTime + AudioManager.releaseTime)
    gainNode.gain.exponentialRampToValueAtTime(0.1, audioContext.currentTime + AudioManager.releaseTime);

    console.log(`stop ${stepIndex}, ${note}`);
  }

}

const audioManager = new AudioManager();
export default audioManager;
