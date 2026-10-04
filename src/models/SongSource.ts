export interface SongSource {
  readonly kind: 'local' | 'remote';
  getUrl(): string;
  release(): void;
}

export class LocalFileSource implements SongSource {
  readonly kind = 'local';
  private readonly objectUrl: string;

  constructor(readonly file: File) {
    this.objectUrl = URL.createObjectURL(file);
  }

  getUrl(): string {
    return this.objectUrl;
  }

  release(): void {
    URL.revokeObjectURL(this.objectUrl);
  }
}

export class RemoteUrlSource implements SongSource {
  readonly kind = 'remote';

  constructor(private readonly url: string) {}

  getUrl(): string {
    return this.url;
  }

  release(): void {}
}
