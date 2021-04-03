
![Lyngua](docs/lyngua.png)

[![Lyngua](https://img.shields.io/badge/app-lyngua-f4511e.svg?style=for-the-badge)](https://lyngua.silentbyte.com)&nbsp;
[![Version](https://img.shields.io/badge/version-1.0-05A5CC.svg?style=for-the-badge)](https://lyngua.silentbyte.com)&nbsp;
[![Status](https://img.shields.io/badge/status-live-00B20E.svg?style=for-the-badge)](https://lyngua.silentbyte.com)
[![Dockerfile](https://img.shields.io/docker/pulls/stephenmo/lyngua?style=for-the-badge)](https://img.shields.io/docker/pulls/stephenmo/lyngua)


# Lyngua

Lyngua is a novel, AI-driven language learning experience powered by [Microsoft Azure Cognitive Models](https://azure.microsoft.com/en-au/services/cognitive-services/). This repository represents our submission for the [Microsoft Azure AI Hackathon](https://azureai.devpost.com/).

This project is live at https://lyngua.silentbyte.com/.


## Inspiration
TODO


## What it does
TODO


## How we built it
Lyngua is split into two separate components, the website which is written in typescript with Vue as the main framework
being used, and a backend API which is a python docker container powered by FastAPI.
![Architecture](docs/ArchitectureDiagram.png)
### Website
Website hosting is done through [Static Website Hosting in Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
which is a very cheap, low effort and reliable way of hosting a static website. Updates are as simple as a 
``az storage blob upload-batch`` command.

{ RICO GO HERE}

### API
The backend API is hosted in a [docker container](https://hub.docker.com/r/stephenmo/lyngua/tags?page=1&ordering=last_updated)
which is written in python and powered by [FastAPI](https://fastapi.tiangolo.com/). The backend is responsible for exposing
some public APIs which are then used by Lyngua to serve content.
### GetVideo
![GetVideo](docs/GetVideo.png)
The GetVideo endpoint is responsible for taking in a youtube URL and a source language, using FFMPEG to pull the audio of 
that video, then using [Azure Cognitive Services Speech API](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text) 
to do text to speech. To reduce hits on the Speech API, translation results are stored in [Azure Blob Storage] so that 
any subsequent call to the same video + source language combination can return from the blob, not the Speech API, making 
subsequent calls significantly more responsive since the process of downloading the video and doing the speech to text 
is a relatively intensive process.

### Pronounce 
![Pronounce](docs/PronounceCall.png)
The pronunciation endpoint takes in the audio recorded by a users microphone along with a ground truth set of words 
which Lyngua has as part of previous calls, to run the [Azure Cognitive Services Speech API in detailed mode](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text#pronunciation-assessment-parameters)
to return a list of words that the user has not pronounced correctly.

For privacy reasons, Lyngua does not store the audio of users recordings.

### Translate
![Translate](docs/Translate.png)
The Translate endpoint hits two different services under the [Azure Cognitive Services Translate API](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/),
the [Dictionary](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-dictionary-lookup) and the [Translate](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-translate)
services.

The Dictionary service is used to establish the type of word that it is (Adjective, Noun, Verb etc), and any additional 
backtranslations the word has for additional context.

## Challenges we ran into
### Inability to use Function App
We originally wanted to go with Azure Function apps because scaling works a lot better, and with Microsofts VS Code 
extensions is an extremly pleasant platform to develop on. Unfortunately our dependency on FFMPEG would mean that we'd 
have to resort to [custom containers](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-function-linux-custom-image?tabs=bash%2Cportal&pivots=programming-language-csharp)
which would require us to update to a premium/dedicated plan which went against our initial goal of trying to make this
as approachable (cheap) as possible for developers.

This is why we ended up writing our backend as a FastAPI powered [Docker container hosted with App Service](https://docs.microsoft.com/en-us/learn/modules/deploy-run-container-app-service/)

### Azure App Service Cold Starts
Azure App Service does a really cool thing if you're the one paying the bills -> It switches your app service  off when 
not in use under the consumption plan and only bills you for the time that it was on.


###
## Accomplishments that we're proud of
TODO


## What we learned
TODO


## What's next for Robin
TODO


---


## Build Instructions

TODO


## License

MIT, see [LICENSE.txt](LICENSE.txt).
