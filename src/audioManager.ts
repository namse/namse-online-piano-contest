const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
gainNode.gain.value = 3.0;
gainNode.connect(audioContext.destination);

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
}

class AudioManager {
  private audios: Audio[]
  private lastBufferSources: { [stepIndex: number]: AudioBufferSourceNode } = {};

  async initialize() {
    const response = await fetch('note.json');
    const notes: {[key: string]: string} = await response.json();

    this.audios = await Promise.all(Object.entries(notes)
      .map(async ([note, soundBase64]) => {
        const soundArrayBuffer = convertBase64ToArrayBuffer(soundBase64);
        const audioBuffer = await audioContext.decodeAudioData(soundArrayBuffer);
        return {
          note,
          audioBuffer,
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
    bufferSource.connect(gainNode);

    console.log(`play ${stepIndex}, ${audio.note}`);
    bufferSource.start();

    this.lastBufferSources[stepIndex] = bufferSource;
  }
  stop(stepIndex: number) {
    const bufferSource = this.lastBufferSources[stepIndex];
    if (!bufferSource) {
      return;
    }
    const audio = this.audios[stepIndex];
    console.log(`stop ${stepIndex}, ${audio.note}`);

    bufferSource.stop();
  }

}

const audioManager = new AudioManager();
export default audioManager;
