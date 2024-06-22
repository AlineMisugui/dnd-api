export class Equipment {
    index: string
    type: string
    count: number

    constructor(index: string, type: string, count: number) {
        this.index = index;
        this.type = type;
        this.count = count;
    }
}