
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

## Goals
We had a few goals with this project
### Make something low cost
Keep costs low - Where possible utilize free tiers or low cost services over the most performance ones. Looking at our spending![Spending](docs/spending.png) we did pretty well on this front
### Learn more about Azure
We've had some exposure to Azure but not a huge amount, so we wanted to learn more about how it worked and how we could
incorporate it into our personal projects.

As a result of the things Stephen learnt on this project he ended up completing his [Azure Certified Developer Associate Certificate](https://www.credly.com/badges/a50a6ac7-486d-40a4-84a7-b8c9e783ec5c?source=linked_in_profile).
![Developer Associate](docs/DeveloperAssociate.png)
### Build something fun and useful
We wanted to build something that sounded like fun, and that we could use. Considering all three of us are trying to
learn at least one language, doing something around learning languages seemed worthwhile.

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
Azure App Service does a really cool thing if you're the one paying the bills -> [It switches your app service off when 
not in use](https://azure.microsoft.com/en-au/blog/understanding-serverless-cold-start/) under the consumption plan
and only bills you for the time that it was on.

The catch with that is because our container is so large (FFMPEG has a lot of dependencies), it takes a while to pull,
so going from being turned off (cold start) can take a while before it will return responses. To improve this time we 
implemented two fixes.
* We reduced the size of the container by using the ``slim`` variant of Ubuntu.
* We added an endpoint to wakeup the API container whenever the website is loaded.

There was an additional fix that could have sped things up (Moving the container to [Azure Container Registry](https://azure.microsoft.com/en-au/pricing/details/container-registry/)
hosted in the same region as our app service to take advantage of the faster azure networking) but we ended up not 
taking this approach to reduce complexity in setting the application up for anyone wanting to run this themselves.


###
## Accomplishments that we're proud of
TODO


## What we learned
TODO


## What's next for Lyngua
TODO


---


## Build Instructions
### Installing Azure CLI

### Setting up Infrastructure
#### Setting up your cognitive services
// Create Speech
// Create Translate

#### Setting up your two storage accounts
To prevent accidental security issues we're going to create two separate storage accounts, one to hold your cached 
translations for youtube videos and the other one to serve your accounts. There is minimal additional cost associated 
with two different accounts as you're only charged for storage, this is mostly to prevent accidents if you set things
to public when they're not meant to be.
// create storage a
// create cache bucket
// create storage b
// set up website

You can skip the rest of this section if you are just doing local development and jump straight to the ```Website``` 
and ```API``` sections


#### Set up App Service
// create app service plan
// create webapp

### Set up CDN
// create CDN
// create endpoint
// rule 1 HTTPS
// rule 2 redirect
// Domain

### Set up CORS
CORS (Cross Origin Resource Sharing) is a way of RICO EXPLAIN.
For purpose of showing this off and giving developers a chance to look at all aspects of this, we're doing something you 
normally wouldn't do in production (allowing all origins.)

### Website
A bash script ```build.sh``` has been added to ```app/``` to automate the running of the commands.
For this to work locally you will need to include a ```app/.env.development.local``` file to the same directory with the url
to your backend API, in the form of ```VUE_APP_API_URL=URL_TO_YOUR_API_HERE```.

Once you have built your Website you can then upload it to your Azure Storage account with
```az storage blob upload-batch --connection-string "YOUR_CONNECTION_STRING_HERE" -d '$web' -s dist```
### API
If you just run the API locally you can pull it using ```docker pull docker pull stephenmo/lyngua:latest``` and run it
using ```docker run stephenmo/lyngua:latest -e AZURE_SPEECH_API_KEY= -e AZURE_SPEECH_ENDPOINT= -e AZURE_TRANSLATE_KEY= -e AZURE_STORAGE_CONNECTION_STRING -p 80:8080``` 
and visiting ```http://localhost:8080``` on your local machine.

If you wanted to build the included code you would need to run ```docker build``` . inside the ```api``` folder and 
run the previous docker run command replacing ```stephenmo/lyngua:latest ``` with the name of your container.

Alternately if your environment supports it you can run a non dockerised version by running ```pip3 install -r requirements.txt```
and ```pip3 install -e .``` inside the ```api``` folder, then run $TODO_CREATE_RUN COMMAND INSTEAD OF python3 somefile.
## License

MIT, see [LICENSE.txt](LICENSE.txt).
