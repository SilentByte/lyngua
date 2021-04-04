/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

class DataWriter {
    private offset = 0;

    constructor(private view: DataView) {
        //
    }

    ascii(text: string) {
        for(let i = 0; i < text.length; i++) {
            this.view.setUint8(this.offset, text.charCodeAt(i));
            this.offset++;
        }

        return this;
    }

    u16(value: number) {
        this.view.setUint16(this.offset, value, true);
        this.offset += 2;
        return this;
    }

    u16a(value: ArrayLike<number>) {
        for(let i = 0; i < value.length; i++) {
            this.u16(value[i]);
        }

        return this;
    }

    u32(value: number) {
        this.view.setUint32(this.offset, value, true);
        this.offset += 4;
        return this;
    }
}

export type AmplitudeListener = (amplitude: number, peak: number) => void;

export class Recorder {
    private readonly processor: ScriptProcessorNode;
    private amplitudeListeners: AmplitudeListener[];

    private isRecording: boolean;
    private recordedSamples: Float32Array[];
    private recordedSampleCount: number;

    constructor(private readonly context: AudioContext,
                private readonly source: MediaStreamAudioSourceNode) {

        this.processor = this.createAudioProcessor();
        this.amplitudeListeners = [];

        this.isRecording = false;
        this.recordedSamples = [];
        this.recordedSampleCount = 0;

        source.connect(this.processor);
    }

    addAmplitudeListener(listener: AmplitudeListener): void {
        this.amplitudeListeners.push(listener);
    }

    removeAmplitudeListener(listener: AmplitudeListener): void {
        this.amplitudeListeners = this.amplitudeListeners.filter((l) => l !== listener);
    }

    removeAllEventListeners(): void {
        this.amplitudeListeners = [];
    }

    reset(): void {
        this.isRecording = false;
        this.recordedSamples = [];
        this.recordedSampleCount = 0;
    }

    start(): void {
        this.reset();
        this.isRecording = true;
    }

    async stop(): Promise<Blob> {
        const blob = this.encode();
        this.reset();
        return blob;
    }

    private createAudioProcessor() {
        const processor = this.context.createScriptProcessor(8192, 1, 1);

        processor.addEventListener("audioprocess", this.onProcessAudio.bind(this));
        processor.connect(this.context.destination);

        return processor;
    }

    private fireAmplitudeEvent(amplitude: number, peak: number) {
        this.amplitudeListeners.forEach((l) => l(amplitude, peak));
    }

    private onProcessAudio(e: AudioProcessingEvent) {
        const buffer = e.inputBuffer.getChannelData(0);

        if(this.isRecording) {
            this.recordedSamples.push(buffer.slice());
            this.recordedSampleCount += buffer.length;
        }

        let amplitude = 0;
        let peak = 0;

        for(const value of buffer) {
            const level = value * value;

            amplitude += level;
            peak = Math.max(peak, level);
        }

        this.fireAmplitudeEvent(Math.sqrt(amplitude / buffer.length), Math.sqrt(peak));
    }

    private mergeSampleBuffers() {
        const buffer = new Float32Array(this.recordedSampleCount);
        let offset = 0;

        this.recordedSamples.forEach((b) => {
            buffer.set(b, offset);
            offset += b.length;
        });

        return buffer;
    }

    private encode() {
        const buffer = this.mergeSampleBuffers();

        const blob = new ArrayBuffer(44 + buffer.length * 2);
        const view = new DataView(blob);
        const writer = new DataWriter(view);

        writer
            .ascii("RIFF")
            .u32(36 + buffer.length * 2)
            .ascii("WAVE")
            .ascii("fmt ")
            .u32(16)
            .u16(1)
            .u16(1)
            .u32(this.context.sampleRate)
            .u32(this.context.sampleRate * 4)
            .u16(2)
            .u16(16)
            .ascii("data")
            .u32(buffer.length * 2)
            .u16a(buffer.map((s) => {
                const limit = Math.max(Math.min(+1, s), -1);
                return limit < 0 ? limit * 0x8000 : limit * 0x7FFF;
            }));

        return new Blob([view], {type: "audio/wav"});
    }
}

export async function connectMicrophone(): Promise<Recorder> {
    const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
    });

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);

    return new Recorder(context, source);
}

let single: Recorder | null = null;

export async function microphone(): Promise<Recorder> {
    if(!single) {
        single = await connectMicrophone();
    }

    return single;
}
