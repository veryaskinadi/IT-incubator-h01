import express, {Request, Response} from 'express';
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json({strict: false}));
const port = 3000;

enum Resolution {
    'P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'
}

type ErrorsMessage = {
    message: String;
    field: String;
}

type Video = {
    id: Number;
    title: String;
    author: String;
    canBeDownloaded: Boolean;
    minAgeRestriction: Number;
    createdAt: String;
    publicationDate: String;
    availableResolutions: Resolution[];
}

const data: Video[] = [];

function validationError(field: string, message: string): ErrorsMessage {
    return { message, field }
}

function validate(data: { [key: string]: unknown }): ErrorsMessage[] {
    const errorsMessages: ErrorsMessage[] = [];

    if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 40) {
        errorsMessages.push(validationError("title", "Wrong title" ))
    }

    if (typeof data.author !== 'string' || !data.author.trim() || data.author.length > 20) {
        errorsMessages.push(validationError("author", "Wrong author" ))
    }

    if (data.availableResolutions && (!Array.isArray(data.availableResolutions) || !data.availableResolutions.every((item: Resolution) => Object.keys(Resolution).includes(String(item))))) {
        errorsMessages.push(validationError("availableResolutions", "Wrong availableResolutions" ))
    }

    if (data.canBeDownloaded && typeof data.canBeDownloaded !== 'boolean') {
        errorsMessages.push(validationError("canBeDownloaded", "Wrong canBeDownloaded" ))
    }

    if (data.minAgeRestriction && (data.minAgeRestriction !== null && (typeof data.minAgeRestriction !== 'number' || data.minAgeRestriction > 18 || data.minAgeRestriction < 1))) {
        errorsMessages.push(validationError("minAgeRestriction", "Wrong minAgeRestriction" ))
    }

    if (data.publicationDate && typeof data.publicationDate !== 'string') {
        errorsMessages.push(validationError("publicationDate", "publicationDate" ))
    }

    return errorsMessages;
}

app.delete('/testing/all-data', (request: Request, response: Response) => {
   data.length = 0
   response.sendStatus(204);
});

app.get('/videos', (request: Request, response: Response) => {
    response.send(data);
});

app.post('/videos', (request: Request, response: Response) => {
    const errorsMessages = validate(request.body);
    if (errorsMessages.length > 0) {
        response.send({ errorsMessages });
    } else {
        const newVideo = {
            ...request.body,
            id: +(new Date())
        }
        data.push(newVideo);
        response.send(newVideo);
    }
});

app.get('/videos/:id', (request: Request, response: Response) => {
    const video = data.find((video: Video) => video.id === Number(request.params.id))
    if (video) {
        response.send(video);
    } else {
        response.sendStatus(404)
    }
});

app.put('/videos/:id', (request: Request, response: Response) => {
    const video = data.find((video: Video) => video.id === Number(request.params.id))
    if (!video) {
        response.sendStatus(404);
        return
    }

    const errorsMessages = validate(request.body);
    if (errorsMessages.length > 0) {
        response.status(400).send({ errorsMessages });
        return
    }

    for (const field in request.body) {
        video[field as keyof Video] = request.body[field]
    }
    response.sendStatus(204);
});

app.delete('/videos/:id', (request: Request, response: Response) => {
    let videoIndex = data.findIndex(v => v.id === Number(request.params.id))

    if(videoIndex === -1){
        response.sendStatus(404)
        return
    }

    data.splice(videoIndex, 1)
    response.sendStatus(204)
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
