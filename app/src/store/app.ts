/*
 * LYNGUA LANGUAGE LEARNING EXPERIENCE
 * Copyright (c) 2021 by SilentByte <https://silentbyte.com/>
 */

import axios from "axios";

import {
    VuexModule,
    Action,
    Module,
    Mutation,
    config as VuexModuleDecoratorsConfig,
} from "vuex-module-decorators";

import store from "@/store";
import LocalStorage from "@/store/local-storage";

export type PronunciationError = "none" | "omission" | "insertion" | "mispronunciation";

export interface IPronunciationScore {
    accuracy: number;
    error: PronunciationError;
}

export interface IWord {
    index: number;
    text: string;
    display: string;
    offset: number;
    duration: number;
    score: IPronunciationScore | null;
}

export interface ITranscription {
    audioUrl: string;
    words: IWord[];
}

export interface IVideoInfo {
    videoId: string;
    canonicalUrl: string;
    thumbnailUrl: string;
    title: string;
    author: string;
}

export function hint<T>(value: T): T {
    return value;
}

export function postpone<T>(handler: () => T): void {
    setTimeout(handler, 0);
}

export function extractYouTubeVideoIdFromUrl(url: string): string | null {
    // See <https://gist.github.com/afeld/1254889>, forcing 10-12 characters.
    const matches = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^?&"'>]{10,12})/.exec(url);
    return matches === null ? null : matches[5];
}

VuexModuleDecoratorsConfig.rawError = true;

const FONT_SIZE_STEP = 0.05;
const FONT_SIZE_MAX = 1.5;
const FONT_SIZE_MIN = 0.5;

@Module({
    store,
    dynamic: true,
    namespaced: true,
    name: "app",
})
export class AppModule extends VuexModule {
    fontSize = LocalStorage.fontSize || 1.0;

    get canDecreaseFontSize(): boolean {
        return this.fontSize > FONT_SIZE_MIN;
    }

    get canIncreaseFontSize(): boolean {
        return this.fontSize < FONT_SIZE_MAX;
    }

    @Mutation
    increaseFontSize(): void {
        this.fontSize = Math.min(this.fontSize + FONT_SIZE_STEP, FONT_SIZE_MAX);
        LocalStorage.fontSize = this.fontSize;
    }

    @Mutation
    decreaseFontSize(): void {
        this.fontSize = Math.max(this.fontSize - FONT_SIZE_STEP, FONT_SIZE_MIN);
        LocalStorage.fontSize = this.fontSize;
    }

    @Action
    async doFetchVideoInfo(payload: { youTubeVideoId: string }): Promise<IVideoInfo | null> {
        const canonicalUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${payload.youTubeVideoId}`);
        try {
            const response = await axios.get(`https://www.youtube.com/oembed?url=${canonicalUrl}&format=json`);
            return {
                videoId: payload.youTubeVideoId,
                canonicalUrl,
                thumbnailUrl: response.data?.thumbnail_url || "",
                title: response.data?.title || "",
                author: response.data?.author_name || "",
            };
        } catch(e) {
            return null;
        }
    }

    @Action
    async doTranscribe(payload: { youTubeVideoId: string }): Promise<ITranscription> {
        // TODO: Implement, first check if transcription.json and audio.mp3 are available in the bucket.
        //       If yes, fetch the cached transcription, otherwise start a conversion job.
        const response = JSON.parse(`{"RecognitionStatus":"Success","Offset":900000,"Duration":608600000,"NBest":[{"Confidence":0.8352593779563904,"Lexical":"this is the lower valley in germany and it used to be a mining region it used to produce huge amounts of anthracite the sort of cold that you have to dig deep deep tunnels to reach sometimes more than a kilometer down to the ground but the last deep coal mine here closed at the end of twenty eighteen as the world steadily shifts to renewables but you can see the legacy of that mining in the landscape in places like this strange hills which are old spoil tips dumping sites for everything that was dug up that wasn't cold all the earth and rock that was moved out of the way to create the mineshafts they are steadily being reclaimed trees have been planted all over an several of them now have art like this at the top i visited one art piece called the tetrahedron yesterday the weather was bad and there was fog and honestly it felt like i was on some sort of alien planet from a sci-fi show the hill i'm standing on has an amphitheater as well although it's a little rundown now it is very very difficult to get across the sheer scale of these on camera the incredible","ITN":"this is the lower valley in germany and it used to be a mining region it used to produce huge amounts of anthracite the sort of cold that you have to dig deep deep tunnels to reach sometimes more than a kilometer down to the ground but the last deep coal mine here closed at the end of 2018 as the world steadily shifts to renewables but you can see the legacy of that mining in the landscape in places like this strange hills which are old spoil tips dumping sites for everything that was dug up that wasn't cold all the earth and rock that was moved out of the way to create the mineshafts they are steadily being reclaimed trees have been planted all over an several of them now have art like this at the top i visited one art piece called the tetrahedron yesterday the weather was bad and there was fog and honestly it felt like i was on some sort of alien planet from a sci-fi show the hill i'm standing on has an amphitheater as well although it's a little rundown now it is very very difficult to get across the sheer scale of these on camera the incredible","MaskedITN":"This is the lower Valley in Germany and it used to be a mining region. It used to produce huge amounts of anthracite. The sort of cold that you have to dig deep deep tunnels to reach. Sometimes more than a kilometer down to the ground. But the last deep coal mine here closed at the end of 2018 as the world steadily shifts to renewables, but you can see the legacy of that mining in the landscape in places like this strange Hills which are old spoil tips. Dumping sites for everything that was dug up that wasn't cold, all the earth and rock that was moved out of the way to create the mineshafts. They are steadily being reclaimed. Trees have been planted all over an several of them now have art like this. At the top I visited one art piece called the Tetrahedron yesterday. The weather was bad and there was fog and honestly it felt like I was on some sort of alien planet from a sci-fi show, The Hill I'm standing on has an amphitheater as well, although it's a little rundown now, it is very, very difficult to get across the sheer scale of these on camera. The incredible.","Display":"This is the lower Valley in Germany and it used to be a mining region. It used to produce huge amounts of anthracite. The sort of cold that you have to dig deep deep tunnels to reach. Sometimes more than a kilometer down to the ground. But the last deep coal mine here closed at the end of 2018 as the world steadily shifts to renewables, but you can see the legacy of that mining in the landscape in places like this strange Hills which are old spoil tips. Dumping sites for everything that was dug up that wasn't cold, all the earth and rock that was moved out of the way to create the mineshafts. They are steadily being reclaimed. Trees have been planted all over an several of them now have art like this. At the top I visited one art piece called the Tetrahedron yesterday. The weather was bad and there was fog and honestly it felt like I was on some sort of alien planet from a sci-fi show, The Hill I'm standing on has an amphitheater as well, although it's a little rundown now, it is very, very difficult to get across the sheer scale of these on camera. The incredible.","Words":[{"Word":"this","Offset":1100000,"Duration":3700000},{"Word":"is","Offset":4900000,"Duration":1700000},{"Word":"the","Offset":6700000,"Duration":2600000},{"Word":"lower","Offset":9400000,"Duration":2400000},{"Word":"valley","Offset":11900000,"Duration":4100000},{"Word":"in","Offset":16300000,"Duration":1500000},{"Word":"germany","Offset":17900000,"Duration":5200000},{"Word":"and","Offset":23400000,"Duration":2400000},{"Word":"it","Offset":25900000,"Duration":1100000},{"Word":"used","Offset":27100000,"Duration":1800000},{"Word":"to","Offset":29000000,"Duration":700000},{"Word":"be","Offset":29800000,"Duration":800000},{"Word":"a","Offset":30700000,"Duration":900000},{"Word":"mining","Offset":31700000,"Duration":4700000},{"Word":"region","Offset":36500000,"Duration":3500000},{"Word":"it","Offset":40300000,"Duration":2100000},{"Word":"used","Offset":42500000,"Duration":1700000},{"Word":"to","Offset":44300000,"Duration":700000},{"Word":"produce","Offset":45100000,"Duration":3100000},{"Word":"huge","Offset":48300000,"Duration":2500000},{"Word":"amounts","Offset":50900000,"Duration":3300000},{"Word":"of","Offset":54300000,"Duration":1300000},{"Word":"anthracite","Offset":55900000,"Duration":8900000},{"Word":"the","Offset":65300000,"Duration":2100000},{"Word":"sort","Offset":67500000,"Duration":1600000},{"Word":"of","Offset":69200000,"Duration":600000},{"Word":"cold","Offset":69900000,"Duration":4100000},{"Word":"that","Offset":74100000,"Duration":2100000},{"Word":"you","Offset":76300000,"Duration":900000},{"Word":"have","Offset":77300000,"Duration":1100000},{"Word":"to","Offset":78500000,"Duration":900000},{"Word":"dig","Offset":79500000,"Duration":2700000},{"Word":"deep","Offset":82300000,"Duration":3900000},{"Word":"deep","Offset":86300000,"Duration":2500000},{"Word":"tunnels","Offset":88900000,"Duration":3300000},{"Word":"to","Offset":92300000,"Duration":700000},{"Word":"reach","Offset":93100000,"Duration":2300000},{"Word":"sometimes","Offset":95500000,"Duration":5800000},{"Word":"more","Offset":101600000,"Duration":2900000},{"Word":"than","Offset":104600000,"Duration":1000000},{"Word":"a","Offset":105700000,"Duration":500000},{"Word":"kilometer","Offset":106300000,"Duration":5300000},{"Word":"down","Offset":111700000,"Duration":2700000},{"Word":"to","Offset":114500000,"Duration":700000},{"Word":"the","Offset":115300000,"Duration":700000},{"Word":"ground","Offset":116100000,"Duration":4500000},{"Word":"but","Offset":122100000,"Duration":5100000},{"Word":"the","Offset":127300000,"Duration":700000},{"Word":"last","Offset":128100000,"Duration":3900000},{"Word":"deep","Offset":132100000,"Duration":2900000},{"Word":"coal","Offset":135100000,"Duration":2800000},{"Word":"mine","Offset":138000000,"Duration":2400000},{"Word":"here","Offset":140500000,"Duration":3800000},{"Word":"closed","Offset":144600000,"Duration":5200000},{"Word":"at","Offset":149900000,"Duration":600000},{"Word":"the","Offset":150600000,"Duration":700000},{"Word":"end","Offset":151400000,"Duration":1400000},{"Word":"of","Offset":152900000,"Duration":700000},{"Word":"twenty","Offset":153700000,"Duration":2500000},{"Word":"eighteen","Offset":156300000,"Duration":4700000},{"Word":"as","Offset":161300000,"Duration":1300000},{"Word":"the","Offset":162700000,"Duration":900000},{"Word":"world","Offset":163700000,"Duration":3100000},{"Word":"steadily","Offset":166900000,"Duration":3100000},{"Word":"shifts","Offset":170100000,"Duration":3700000},{"Word":"to","Offset":173900000,"Duration":900000},{"Word":"renewables","Offset":174900000,"Duration":6700000},{"Word":"but","Offset":184100000,"Duration":4500000},{"Word":"you","Offset":188700000,"Duration":700000},{"Word":"can","Offset":189500000,"Duration":1300000},{"Word":"see","Offset":190900000,"Duration":1500000},{"Word":"the","Offset":192500000,"Duration":1500000},{"Word":"legacy","Offset":194100000,"Duration":4900000},{"Word":"of","Offset":199100000,"Duration":700000},{"Word":"that","Offset":199900000,"Duration":1600000},{"Word":"mining","Offset":201600000,"Duration":3800000},{"Word":"in","Offset":205700000,"Duration":1200000},{"Word":"the","Offset":207000000,"Duration":700000},{"Word":"landscape","Offset":207800000,"Duration":5800000},{"Word":"in","Offset":213900000,"Duration":1500000},{"Word":"places","Offset":215500000,"Duration":5900000},{"Word":"like","Offset":222500000,"Duration":5100000},{"Word":"this","Offset":227700000,"Duration":4200000},{"Word":"strange","Offset":232200000,"Duration":5200000},{"Word":"hills","Offset":237500000,"Duration":4700000},{"Word":"which","Offset":242300000,"Duration":1600000},{"Word":"are","Offset":244000000,"Duration":1000000},{"Word":"old","Offset":245100000,"Duration":3100000},{"Word":"spoil","Offset":248300000,"Duration":4100000},{"Word":"tips","Offset":252500000,"Duration":3900000},{"Word":"dumping","Offset":257100000,"Duration":5700000},{"Word":"sites","Offset":262900000,"Duration":3500000},{"Word":"for","Offset":266500000,"Duration":1200000},{"Word":"everything","Offset":267800000,"Duration":2900000},{"Word":"that","Offset":270800000,"Duration":900000},{"Word":"was","Offset":271800000,"Duration":1100000},{"Word":"dug","Offset":273000000,"Duration":2000000},{"Word":"up","Offset":275100000,"Duration":4600000},{"Word":"that","Offset":280000000,"Duration":2400000},{"Word":"wasn't","Offset":282500000,"Duration":3900000},{"Word":"cold","Offset":286500000,"Duration":4400000},{"Word":"all","Offset":291200000,"Duration":1600000},{"Word":"the","Offset":292900000,"Duration":1100000},{"Word":"earth","Offset":294100000,"Duration":4300000},{"Word":"and","Offset":298500000,"Duration":2100000},{"Word":"rock","Offset":300700000,"Duration":5300000},{"Word":"that","Offset":306600000,"Duration":900000},{"Word":"was","Offset":307600000,"Duration":1300000},{"Word":"moved","Offset":309000000,"Duration":2500000},{"Word":"out","Offset":311800000,"Duration":2500000},{"Word":"of","Offset":314400000,"Duration":500000},{"Word":"the","Offset":315000000,"Duration":900000},{"Word":"way","Offset":316000000,"Duration":4100000},{"Word":"to","Offset":320800000,"Duration":2300000},{"Word":"create","Offset":323200000,"Duration":2900000},{"Word":"the","Offset":326200000,"Duration":700000},{"Word":"mineshafts","Offset":327000000,"Duration":7600000},{"Word":"they","Offset":335400000,"Duration":1200000},{"Word":"are","Offset":336700000,"Duration":500000},{"Word":"steadily","Offset":337300000,"Duration":2800000},{"Word":"being","Offset":340200000,"Duration":1600000},{"Word":"reclaimed","Offset":341900000,"Duration":5500000},{"Word":"trees","Offset":347700000,"Duration":5600000},{"Word":"have","Offset":353400000,"Duration":900000},{"Word":"been","Offset":354400000,"Duration":1100000},{"Word":"planted","Offset":355600000,"Duration":3300000},{"Word":"all","Offset":359000000,"Duration":1500000},{"Word":"over","Offset":360600000,"Duration":3100000},{"Word":"an","Offset":364400000,"Duration":2900000},{"Word":"several","Offset":367400000,"Duration":3100000},{"Word":"of","Offset":370600000,"Duration":500000},{"Word":"them","Offset":371200000,"Duration":2900000},{"Word":"now","Offset":374400000,"Duration":2100000},{"Word":"have","Offset":376600000,"Duration":3700000},{"Word":"art","Offset":380600000,"Duration":5100000},{"Word":"like","Offset":386000000,"Duration":2900000},{"Word":"this","Offset":389000000,"Duration":3200000},{"Word":"at","Offset":392300000,"Duration":800000},{"Word":"the","Offset":393200000,"Duration":700000},{"Word":"top","Offset":394000000,"Duration":3500000},{"Word":"i","Offset":399200000,"Duration":3700000},{"Word":"visited","Offset":403000000,"Duration":3300000},{"Word":"one","Offset":406400000,"Duration":1900000},{"Word":"art","Offset":408400000,"Duration":1700000},{"Word":"piece","Offset":410200000,"Duration":2700000},{"Word":"called","Offset":413000000,"Duration":2700000},{"Word":"the","Offset":415800000,"Duration":900000},{"Word":"tetrahedron","Offset":416800000,"Duration":9900000},{"Word":"yesterday","Offset":427000000,"Duration":6100000},{"Word":"the","Offset":434400000,"Duration":3100000},{"Word":"weather","Offset":437600000,"Duration":2300000},{"Word":"was","Offset":440000000,"Duration":1900000},{"Word":"bad","Offset":442000000,"Duration":4400000},{"Word":"and","Offset":446500000,"Duration":2200000},{"Word":"there","Offset":448800000,"Duration":1000000},{"Word":"was","Offset":449900000,"Duration":1800000},{"Word":"fog","Offset":451800000,"Duration":3600000},{"Word":"and","Offset":455700000,"Duration":3800000},{"Word":"honestly","Offset":459800000,"Duration":5700000},{"Word":"it","Offset":465600000,"Duration":1300000},{"Word":"felt","Offset":467000000,"Duration":1900000},{"Word":"like","Offset":469000000,"Duration":1900000},{"Word":"i","Offset":471000000,"Duration":200000},{"Word":"was","Offset":471300000,"Duration":1200000},{"Word":"on","Offset":472600000,"Duration":1500000},{"Word":"some","Offset":474200000,"Duration":2300000},{"Word":"sort","Offset":476600000,"Duration":2700000},{"Word":"of","Offset":479400000,"Duration":2700000},{"Word":"alien","Offset":482400000,"Duration":4100000},{"Word":"planet","Offset":486600000,"Duration":3300000},{"Word":"from","Offset":490000000,"Duration":1300000},{"Word":"a","Offset":491400000,"Duration":500000},{"Word":"sci-fi","Offset":492000000,"Duration":3900000},{"Word":"show","Offset":496000000,"Duration":3500000},{"Word":"the","Offset":501000000,"Duration":3000000},{"Word":"hill","Offset":504100000,"Duration":1300000},{"Word":"i'm","Offset":505500000,"Duration":1200000},{"Word":"standing","Offset":506800000,"Duration":3700000},{"Word":"on","Offset":510600000,"Duration":1800000},{"Word":"has","Offset":512700000,"Duration":3400000},{"Word":"an","Offset":516200000,"Duration":1300000},{"Word":"amphitheater","Offset":517600000,"Duration":6400000},{"Word":"as","Offset":524300000,"Duration":1600000},{"Word":"well","Offset":526000000,"Duration":2700000},{"Word":"although","Offset":529000000,"Duration":4600000},{"Word":"it's","Offset":534000000,"Duration":3100000},{"Word":"a","Offset":537200000,"Duration":300000},{"Word":"little","Offset":537600000,"Duration":2100000},{"Word":"rundown","Offset":539800000,"Duration":5700000},{"Word":"now","Offset":545800000,"Duration":3700000},{"Word":"it","Offset":552900000,"Duration":2200000},{"Word":"is","Offset":555200000,"Duration":1500000},{"Word":"very","Offset":556800000,"Duration":3900000},{"Word":"very","Offset":560800000,"Duration":2700000},{"Word":"difficult","Offset":563600000,"Duration":4100000},{"Word":"to","Offset":567800000,"Duration":700000},{"Word":"get","Offset":568600000,"Duration":1300000},{"Word":"across","Offset":570000000,"Duration":3700000},{"Word":"the","Offset":573800000,"Duration":1300000},{"Word":"sheer","Offset":575200000,"Duration":5500000},{"Word":"scale","Offset":581000000,"Duration":6900000},{"Word":"of","Offset":588000000,"Duration":1100000},{"Word":"these","Offset":589200000,"Duration":2500000},{"Word":"on","Offset":591800000,"Duration":1100000},{"Word":"camera","Offset":593000000,"Duration":3500000},{"Word":"the","Offset":596600000,"Duration":1200000},{"Word":"incredible","Offset":597900000,"Duration":10400000}]}]}`);
        return {
            audioUrl: "",
            words: response.NBest[0].Words.map((w: any, i: number) => hint<IWord>({
                index: i,
                text: w.Word,
                display: w.Word,
                offset: w.Offset / 10_000_000,
                duration: w.Duration / 10_000_000,
                score: null,
            })),
        };
    }
}
