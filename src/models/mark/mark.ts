export class MarkModel {
    constructor(
        public id: number,
        public markDay: string,
        public markHour: string
    ) { }

    static fromJson(data: any) {
        return new MarkModel(data.id, data.markDay, data.markHour);
    }
}