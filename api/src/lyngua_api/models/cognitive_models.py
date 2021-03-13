from pydantic import BaseModel
from typing import List


class _AudioWords(BaseModel):
    Word: str
    Offset: int
    Duration: int
    AccuracyScore: float
    ErrorType: str


class _STTWords(BaseModel):
    Word: str
    Offset: int
    Duration: int


class _STTNBest(BaseModel):
    Confidence: float
    Lexical: str
    ITN: str
    MaskedITN: str
    Display: str
    Words: List[_STTWords]


class _PronounceNBest(BaseModel):  # Basically what gets returned from STT but includes a word list
    Lexical: str
    ITN: str
    MaskedITN: str
    Display: str
    AccuracyScore: str
    FluencyScore: float
    CompletenessScore: float
    PronScore: float
    Words: List[_AudioWords]


class _AudioResponse(BaseModel):
    RecognitionStatus: str
    Offset: int
    Duration: int


class SpeechToTextResponse(_AudioResponse):
    NBest: List[_STTNBest]


class PronounceResponse(_AudioResponse):
    NBest: List[_PronounceNBest]


class _TranslationData(BaseModel):
    text: str
    to: str


class TranslationResponse(BaseModel):
    translations: List[_TranslationData]


class LanguageDiscoverResponse(BaseModel):
    language: str
    score: float
    isTranslationSupported: bool
    isTransliterationSupported: bool
