export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class HttpRequest {
  // 1. Déclaration explicite des propriétés pour satisfaire erasableSyntaxOnly
  public readonly domain: string;
  public readonly path: string;
  public readonly method: HttpMethod;
  public readonly headers: Map<string, string>;
  public readonly body: unknown;
  public readonly timeoutMs: number;

  public constructor(
    domain: string,
    path: string,
    method: HttpMethod,
    headers: Map<string, string>,
    body: unknown = null,
    timeoutMs: number = 8000
  ) {
    // Assignation classique
    this.domain = domain;
    this.path = path;
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.timeoutMs = timeoutMs;
  }

  public async request<T>(): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    // 2. Utilisation de l'API native Headers pour satisfaire le typage strict
    const nativeHeaders = new Headers(Object.fromEntries(this.headers.entries()));

    if (this.body && this.method !== 'GET') {
      if (!nativeHeaders.has('Content-Type')) {
        nativeHeaders.set('Content-Type', 'application/json');
      }
    }

    const options: RequestInit = {
      method: this.method,
      headers: nativeHeaders, // On passe l'objet Headers natif
      signal: controller.signal
    };

    if (this.body && this.method !== 'GET') {
      options.body = JSON.stringify(this.body);
    }

    try {
      const response = await fetch(this.domain + this.path, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Timeout : La requête a dépassé les ${this.timeoutMs}ms`);
      }
      throw error;
    }
  }
}

export class HttpRequestBuilder {
  // 1. Déclaration explicite pour le constructeur du Builder
  private readonly httpRequest: HttpRequest;

  public constructor(
    httpRequest: HttpRequest = new HttpRequest("", "", "GET", new Map())
  ) {
    this.httpRequest = httpRequest;
  }

  public withDomain(domain: string) {
    return new HttpRequestBuilder(
      new HttpRequest(domain, this.httpRequest.path, this.httpRequest.method, this.httpRequest.headers, this.httpRequest.body, this.httpRequest.timeoutMs)
    );
  }

  public withPath(path: string) {
    return new HttpRequestBuilder(
      new HttpRequest(this.httpRequest.domain, path, this.httpRequest.method, this.httpRequest.headers, this.httpRequest.body, this.httpRequest.timeoutMs)
    );
  }

  public withMethod(method: HttpMethod) {
    return new HttpRequestBuilder(
      new HttpRequest(this.httpRequest.domain, this.httpRequest.path, method, this.httpRequest.headers, this.httpRequest.body, this.httpRequest.timeoutMs)
    );
  }

  public withHeader(name: string, value: string) {
    const newHeaders = new Map(this.httpRequest.headers);
    newHeaders.set(name, value);

    return new HttpRequestBuilder(
      new HttpRequest(this.httpRequest.domain, this.httpRequest.path, this.httpRequest.method, newHeaders, this.httpRequest.body, this.httpRequest.timeoutMs)
    );
  }

  public withBody(body: unknown) {
    return new HttpRequestBuilder(
      new HttpRequest(this.httpRequest.domain, this.httpRequest.path, this.httpRequest.method, this.httpRequest.headers, body, this.httpRequest.timeoutMs)
    );
  }

  public withTimeout(ms: number) {
    return new HttpRequestBuilder(
      new HttpRequest(this.httpRequest.domain, this.httpRequest.path, this.httpRequest.method, this.httpRequest.headers, this.httpRequest.body, ms)
    );
  }

  public build() {
    return this.httpRequest;
  }
}