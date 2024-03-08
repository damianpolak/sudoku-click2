type Note = {
  value: number;
  active: boolean;
};

export type Notes = Note[];

export class NotesBuilder {
  private notes: Set<Note> = new Set();
  private static readonly MIN_NUMBER = 1;
  private static readonly MAX_NUMBER = 9;
  constructor(numbers: number[] = []) {
    this.create(numbers);
    return this;
  }

  protected create(numbers: number[]): void {
    this.validate(numbers);

    this.notes = new Set();
    const mode: 'empty' | 'partial' = numbers.length > 0 ? 'partial' : 'empty';
    for (let i = NotesBuilder.MIN_NUMBER; i <= NotesBuilder.MAX_NUMBER; i++) {
      this.notes.add({
        value: i,
        active: mode === 'empty' ? false : numbers.includes(i) ? true : false,
      });
    }
  }

  update(numbers: number[] = []): this {
    this.validate(numbers);

    this.notes = new Set(
      Array.from(this.notes).map((x) => {
        if (numbers.includes(x.value)) {
          return {
            value: x.value,
            active: !x.active,
          };
        } else {
          return x;
        }
      })
    );
    return this;
  }

  get(): Notes {
    return Array.from(this.notes);
  }

  getActive(): Notes {
    return Array.from(this.notes).filter((x) => x.active);
  }

  getActiveNumbers(): number[] {
    return Array.from(this.notes)
      .filter((i) => i.active)
      .map((i) => i.value);
  }

  protected validate(numbers: number[]): void | never {
    if (!numbers.every((x) => x >= NotesBuilder.MIN_NUMBER && x <= NotesBuilder.MAX_NUMBER)) {
      throw new RangeError('The numbers must be in the range 1 to 9');
    }
  }
}
