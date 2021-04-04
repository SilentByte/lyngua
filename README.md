
![Lyngua](docs/lyngua.png)

[![Lyngua](https://img.shields.io/badge/app-lyngua-f4511e.svg?style=for-the-badge)](https://lyngua.silentbyte.com)&nbsp;
[![Version](https://img.shields.io/badge/version-1.0-05A5CC.svg?style=for-the-badge)](https://lyngua.silentbyte.com)&nbsp;
[![Status](https://img.shields.io/badge/status-live-00B20E.svg?style=for-the-badge)](https://lyngua.silentbyte.com)
[![Dockerfile](https://img.shields.io/docker/pulls/stephenmo/lyngua?style=for-the-badge)](https://img.shields.io/docker/pulls/stephenmo/lyngua)
[![Deploy](https://img.shields.io/github/workflow/status/SilentByte/lyngua/main?label=Deploy&style=for-the-badge)](https://github.com/SilentByte/lyngua/actions/workflows/main.yml)
# Lyngua

Lyngua is a novel, AI-driven language learning experience powered by [Microsoft Azure Cognitive Services](https://azure.microsoft.com/en-au/services/cognitive-services/). This repository represents our submission for the [Microsoft Azure AI Hackathon](https://azureai.devpost.com/).

This project is live at https://lyngua.silentbyte.com/.


## Inspiration
TODO


## What it does
TODO


## Goals
We had a few goals with this project
### Make something low cost
Keep costs low - Where possible utilize free tiers or low cost services over the most performance ones. 
Looking at our spending we did pretty well on this front

![Spending](docs/spending.png) 

### Build something fun and useful
We wanted to build something that sounded like fun, and that we could use. Considering all three of us are trying to
learn at least one language, doing something around learning languages seemed worthwhile.

### Make it understandable

## How we built it
### Azure Components used
* [Azure Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction)
* [Azure Blob Storage Static Website](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
* [Azure CDN](https://docs.microsoft.com/en-us/azure/cdn/cdn-overview)
* [Azure Web App Service](https://docs.microsoft.com/en-us/azure/app-service/overview)
* [Azure Cognitive Services Translator](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/)
* [Azure Cognitive Services Speech](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/)

### Architecture
Lyngua is split into two separate components, the website which is written in typescript with Vue as the main framework
being used, and a backend API which is a python docker container powered by FastAPI.


![Architecture](docs/ArchitectureDiagram.png)
### Website
Website hosting is done through [Static Website Hosting in Azure Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
which is a very cheap, low effort and reliable way of hosting a static website. Updates are as simple as a 
``az storage blob upload-batch`` command.

The website is written using Typescript with Vue and Vuetify used as the main frameworks and is available in the ```app``` folder.

### API
![Architecture](docs/API_arch.png)

The backend API is hosted as an [Azure App Service WebApp](https://docs.microsoft.com/en-us/azure/app-service/overview).
This API is deployed as a [custom docker container](https://docs.microsoft.com/en-us/azure/app-service/quickstart-custom-container?pivots=container-linux) called [lyngua](https://hub.docker.com/r/stephenmo/lyngua)
which is written in Python 3.8 and powered by the [FastAPI](https://fastapi.tiangolo.com/) framework with [Uvicorn](https://www.uvicorn.org/) 
as as the server (synchronous Server Gateway Interface).

This backend API is responsible for exposing three public endpoints which coordinate multiple azure resource calls.

### GetVideo
![GetVideo](docs/GetVideo.png)

The GetVideo endpoint is responsible for generated the Speech to Text (STT) transcription using the [Azure Cognitive Services Speech API](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text).
* It will first check [Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) to see if a previous STT exists, if it does then it'll pull the cached version.
* If the cached results do not exist then [FFmpeg](https://www.ffmpeg.org/) is used to pull the audio from youtube
* This audio is then fed into the [Azure Cognitive Services Speech API](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text).
to generate a STT transcription.
* The STT transcription is then saved to [Blob Storage](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) keyed with the video id and source language.

Caching was done for two main reasons
1. The process of downloading a video and then transcribing it takes some time (generally under 30 seconds), so caching 
any previous results makes Lyngua significantly more responsive.
2. The Speech to Text API is billed per minute of audio, so it's significantly cheaper to cache any common results that 
multiple users may be requesting.

### Pronounce 
![Pronounce](docs/PronounceCall.png)

The pronounciation endpoint takes in audio recorded from the users microphone along with the ground truth set of words 
established by the users selection and sends them to [Azure Cognitive Services Speech API in detailed mode](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-speech-to-text#pronunciation-assessment-parameters).
Lyngua will then show a list of words that the user has not pronounced correctly, and the confidence of that prediction.

For privacy reasons, Lyngua does not store the audio of users recordings.

### Translate
![Translate](docs/Translate.png)

The translate endpoint uses two different services under the [Azure Cognitive Services Translate API](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/)
banner.
* [Dictionary](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-dictionary-lookup) 
which used to establish the type of word (Adjective, Noun, Verb etc) and any additional back-translations the word has to
get more context around the translation.
* [Translate](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/reference/v3-0-translate) to generate
the actual translations that are displayed to the user.

## Challenges we ran into
### Inability to use Function App
We originally wanted to go with Azure Function apps because scaling works a lot better, and with Microsofts VS Code 
extensions is an extremly pleasant platform to develop on. Unfortunately our dependency on FFmpeg would mean that we'd 
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

### Continuous Integration/Continuous Deployment
From a [previous hackathon](https://devpost.com/software/maskcam) we learnt that it would probably be important to set 
up continuous integration/deployment to try to catch integration errors quickly.

Part of the testing process spins up the API as a docker container and runs some test calls to check that the endpoints
work correctly. Due to the way that github action handles environment variables with escape characters we had some 
trouble getting these tests to work under github actions as the Azure Storage Keys were being passed incorrectly.
Ultimately because we left things to the last minute, we ended up avoiding running pytest and instead just tested
whether the container would build and whether the lyngua package would install.

The automating deployments was easy enough with the [Azure CLI](https://github.com/marketplace/actions/azure-cli-action) 
and [Build and push Docker images](https://github.com/marketplace/actions/build-and-push-docker-images) Github Actions.
These actions can be found in ```.github/workflows/main.yml```

### Microphone
{{RICO}}
###
## Accomplishments that we're proud of
### Setting up Continuous Deployment
This hackathon will mark the first time that we set up Continous Deployment in an effort to stop the usual 
"can you push the changes to prod" blocker that we've encountered in the past. This will also be the first time that we 
have tried setting up Github Actions as a CICD runner as we've previously only used Jentinks, Teamcity and TravisCI.

### 
## What we learned
### Github Actions
This was a good chance for us to learn how to use github actions instead of less open CICD runners.

### Learn more about Azure
We've had some exposure to Azure but not a huge amount, so we wanted to learn more about how it worked and how we could
incorporate it into our personal projects.

As a result of the things Stephen learnt on this project he ended up completing his [Azure Certified Developer Associate Certificate](https://www.credly.com/badges/a50a6ac7-486d-40a4-84a7-b8c9e783ec5c?source=linked_in_profile).

![Developer Associate](docs/DeveloperAssociate.png)
## What's next for Lyngua
TODO


---


## Build Instructions
### Installing build tools
* NPM
* Docker
* Azure CLI
* Environment Variables used by commands

$AZURE_LOCATION = westus
$AZURE_RG_NAME = lyngua_rg
### Setting up Infrastructure
### Set up your resource group
The resource group is the "container" that holds all the various azure resource you're going to create.
```az group create --name $AZURE_RG_NAME --location $AZURE_LOCATION```

[Documentation link](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-cli)
#### Setting up your cognitive services
&& TODO ON BOTH OF THESE: CHECK SKU
For the purpose of setting this up, i'll use the free SKU, it's worth brushing up on the limits for translate and speech TODO LINKS.


Create your Speech Services resource and get the required key
```
az cognitiveservices account create --name speechapi --resource-group $AZURE_RG_NAME --kind SpeechServices --sku f1 \
--location $AZURE_LOCATION

az cognitiveservices account keys list --name speechapi --resource-group $AZURE_RG_NAME
```
Create your Text Translation resource and get the required key
```
az cognitiveservices account create --name translateapi --resource-group $AZURE_RG_NAME --kind TextTranslation --sku f1 \
--location $AZURE_LOCATION
az cognitiveservices account keys list --name translateapi --resource-group $AZURE_RG_NAME
```
[Documentation](https://docs.microsoft.com/en-us/cli/azure/cognitiveservices/account?view=azure-cli-latest)
#### Setting up your storage account
To prevent accidental security issues we're going to create two separate storage accounts, one to hold your cached 
translations for youtube videos and the other one to serve your accounts. There is minimal additional cost associated 
with two different accounts as you're only charged for storage, this is mostly to prevent accidents if you set things
to public when they're not meant to be.

https://docs.microsoft.com/en-us/cli/azure/storage/account?view=azure-cli-latest#commands
https://docs.microsoft.com/en-us/cli/azure/storage/container?view=azure-cli-latest
```
az storage account create --sku Standard_LRS

az storage account create --allow-blob-public-access --sku Standard_LRS
az storage container create

az storage blob service-properties update \ 
--account-name soheilstorage \ 
--static-website \ 
--404-document error.html \ 
--index-document index.html

```

You can skip the rest of this section if you are just doing local development and jump straight to the ```Website``` 
and ```API``` sections


#### Set up App Service
Create a plan
```
az appservice plan
az webapp create
az webapp deployment
az webapp deployment container config --enable-cd true --name MyWebapp --resource-group MyResourceGroup

```
create a webapp
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


## Areas for improvement
### CICD
There are a few places that our CICD pipelines could be improved
* Fixing tests
    * As outlined in our Challenges we ran into section, we had some difficulty getting one of our main tests working 
  properly due to the way Github Actions is handling escape characters. We would like to fix this up at some point.
*  Staging deployments
    * Currently our github actions have only a single deployment (prod). App services supports [staging slots](https://docs.microsoft.com/en-us/azure/app-service/deploy-staging-slots)
    for this purpose. We would like to have another develop branch to auto deploy into a non prod test environment.

### Speech Timeout
* 5 second speech timeout
    * Azure Speech to text will detect if there is no speech in the first 5 seconds of the audio. Currently we just 
    abort on this case. We would like to try rerunning the request again with the audio trimmed as we have found that 
    videos commonly have a non speech music intro that causes our request to fail.
    
### Azure Resources
Currently our deployment process involves running a set of CLI commands. This could be improved with
[Azure Resource Manager (ARM) Templates](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/overview).

## License

MIT, see [LICENSE.txt](LICENSE.txt).


## References
REF https://purple.telstra.com/blog/host-your-static-website-in-azure-storage-using-azure-cli