export class Response<T> {
    private result: boolean;
    private data?: T;
    private error?: string;

    constructor(result: boolean, data?: T, error?: string) {
        this.result = result;
        this.data = data;
        this.error = error;
    }

    public create() {
        return {
            result: this.result,
            data: this?.data,
            error: this?.error,
        };
    }
}