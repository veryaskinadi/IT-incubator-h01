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
    title: String;
    author: String;
    canBeDownloaded: Boolean;
    minAgeRestriction: Number;
    createdAt: String;
    publicationDate: String;
    availableResolutions: Resolution[];
}

const data: Video[] = [];

const isObject = (obj: unknown) => typeof obj === 'object' && !Array.isArray(obj) && obj!== null;

function validationError(field: string, message: string): ErrorsMessage {
    return { message, field }
}

function validate(data: { [key: string]: unknown }): ErrorsMessage[] {
    const errorsMessages: ErrorsMessage[] = [];
    if (!data || !isObject(data)) {
        errorsMessages.push(validationError("title", "Wrong title" ))
        errorsMessages.push(validationError("author", "Wrong author" ))
        return errorsMessages;
    }
    if (typeof data.title !== 'string') {
        errorsMessages.push(validationError("title", "Wrong title" ))
    }
    if (typeof data.author !== 'string') {
        errorsMessages.push(validationError("author", "Wrong author" ))
    }
    if (data.availableResolutions && (!Array.isArray(data.availableResolutions) || !data.availableResolutions.every((item: Resolution) => Object.keys(Resolution).includes(String(item))))) {
        errorsMessages.push(validationError("availableResolutions", "Wrong availableResolutions" ))
    }

    return errorsMessages;
}

function validateUpdate(data: { [key: string]: unknown }): ErrorsMessage[] {
    const errorsMessages: ErrorsMessage[] = [];
    if (data && isObject(data) && data.title && typeof data.title !== 'string') {
        errorsMessages.push(validationError("title", "Wrong title" ))
    }
    if (data && isObject(data) && data.author && typeof data.author !== 'string') {
        errorsMessages.push(validationError("author", "Wrong author" ))
    }
    if (data.availableResolutions && (!Array.isArray(data.availableResolutions) || !data.availableResolutions.every((item: Resolution) => Object.keys(Resolution).includes(String(item))))) {
        errorsMessages.push(validationError("availableResolutions", "Wrong availableResolutions" ))
    }

    return errorsMessages;
}

app.get('/', (req: Request, res: Response) => {
    let message = 'Hello my crazy life!';
    res.send(message);
});

app.delete('/testing/all-data', (request: Request, response: Response) => {
   response.sendStatus(204);
});

app.get('/videos', (request: Request, response: Response) => {
    response.send(
        data.map((video, id) => {
            return { id, ...video }
        }).filter(video => video)
    );
});

app.post('/videos', (request: Request, response: Response) => {
    const errorsMessages = validate(request.body);
    if (errorsMessages.length > 0) {
        response.send({ errorsMessages });
    } else {
        data.push(request.body);
        response.send({
            id: data.length - 1,
            ...request.body,
        });
    }
});

app.get('/videos/:id', (request: Request, response: Response) => {
    if (data[Number(request.params.id)]) {
        response.send( {
            id: Number(request.params.id),
            ...data[Number(request.params.id)],
        });
    } else {
        response.sendStatus(404)
    }
});

app.put('/videos/:id', (request: Request, response: Response) => {
    if (!data[Number(request.params.id)]) {
        response.sendStatus(404);
        return
    }
    const errorsMessages = validateUpdate(request.body);
    if (errorsMessages.length > 0) {
        response.status(400);
        response.send({ errorsMessages });
        return
    }
    for (const field in request.body) {
        data[Number(request.params.id)][field as keyof Video] = request.body[field]
    }
    response.sendStatus(204);
});

app.delete('/videos/:id', (request: Request, response: Response) => {
    if (data[Number(request.params.id)]) {
        delete data[Number(request.params.id)]
        response.sendStatus(204)
    } else {
        response.sendStatus(404)
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
