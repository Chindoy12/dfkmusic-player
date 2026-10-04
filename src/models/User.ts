export class User {
  constructor(
    readonly id: string,
    readonly email: string,
  ) {}

  get displayName(): string {
    return this.email.split('@')[0];
  }
}
