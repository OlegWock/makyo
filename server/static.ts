import type { Context, Env, MiddlewareHandler } from "hono";

// Copied from https://github.com/honojs/hono/blob/main/src/middleware/serve-static/index.ts#L20
// And adapted to allow fallback for SPA
// Ref: https://github.com/honojs/hono/issues/1859

type FilePathOptions = {
  filename: string
  root?: string
  defaultDocument?: string
}

const getFilePath = (options: FilePathOptions): string | undefined => {
  let filename = options.filename
  const defaultDocument = options.defaultDocument || 'index.html'

  if (filename.endsWith('/')) {
    // /top/ => /top/index.html
    filename = filename.concat(defaultDocument)
  } else if (!filename.match(/\.[a-zA-Z0-9]+$/)) {
    // /top => /top/index.html
    filename = filename.concat('/' + defaultDocument)
  }

  const path = getFilePathWithoutDefaultDocument({
    root: options.root,
    filename,
  })

  return path
}

const getFilePathWithoutDefaultDocument = (
  options: Omit<FilePathOptions, 'defaultDocument'>
) => {
  let root = options.root || ''
  let filename = options.filename

  if (/(?:^|[\/\\])\.\.(?:$|[\/\\])/.test(filename)) {
    return
  }

  // /foo.html => foo.html
  filename = filename.replace(/^\.?[\/\\]/, '')

  // foo\bar.txt => foo/bar.txt
  filename = filename.replace(/\\/, '/')

  // assets/ => assets
  root = root.replace(/\/$/, '')

  // ./assets/foo.html => assets/foo.html
  let path = root ? root + '/' + filename : filename
  path = path.replace(/^\.?\//, '')

  return path
}

const getMimeType = (filename: string, mimes = baseMimes): string | undefined => {
  const regexp = /\.([a-zA-Z0-9]+?)$/
  const match = filename.match(regexp)
  if (!match) {
    return
  }
  let mimeType = mimes[match[1]]
  if ((mimeType && mimeType.startsWith('text')) || mimeType === 'application/json') {
    mimeType += '; charset=utf-8'
  }
  return mimeType
};

export const getExtension = (mimeType: string): string | undefined => {
  for (const ext in baseMimes) {
    if (baseMimes[ext] === mimeType) {
      return ext
    }
  }
};

const baseMimes: Record<string, string> = {
  aac: 'audio/aac',
  avi: 'video/x-msvideo',
  avif: 'image/avif',
  av1: 'video/av1',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  css: 'text/css',
  csv: 'text/csv',
  eot: 'application/vnd.ms-fontobject',
  epub: 'application/epub+zip',
  gif: 'image/gif',
  gz: 'application/gzip',
  htm: 'text/html',
  html: 'text/html',
  ico: 'image/x-icon',
  ics: 'text/calendar',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript',
  json: 'application/json',
  jsonld: 'application/ld+json',
  map: 'application/json',
  mid: 'audio/x-midi',
  midi: 'audio/x-midi',
  mjs: 'text/javascript',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  oga: 'audio/ogg',
  ogv: 'video/ogg',
  ogx: 'application/ogg',
  opus: 'audio/opus',
  otf: 'font/otf',
  pdf: 'application/pdf',
  png: 'image/png',
  rtf: 'application/rtf',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  ts: 'video/mp2t',
  ttf: 'font/ttf',
  txt: 'text/plain',
  wasm: 'application/wasm',
  webm: 'video/webm',
  weba: 'audio/webm',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  xhtml: 'application/xhtml+xml',
  xml: 'application/xml',
  zip: 'application/zip',
  '3gp': 'video/3gpp',
  '3g2': 'video/3gpp2',
  gltf: 'model/gltf+json',
  glb: 'model/gltf-binary',
};


export type ServeStaticOptions<E extends Env = Env> = {
  root?: string;
  fallbackPath: string;
  path?: string;
  mimes?: Record<string, string>;
  rewriteRequestPath?: (path: string) => string;
  onNotFound?: (path: string, c: Context<E>) => void | Promise<void>;
}

const DEFAULT_DOCUMENT = 'index.html'

const getContent = async (path: string): Promise<ReadableStream | null> => {
  const file = Bun.file(path);
  // @ts-ignore
  return (await file.exists()) ? file.stream() : null;
}
const pathResolve = (path: string) => {
  return `/${path}`;
}

export const serveStatic = <E extends Env = Env>(
  options: ServeStaticOptions<E>
): MiddlewareHandler => {
  return async (c, next) => {
    // Do nothing if Response is already set
    if (c.finalized) {
      await next()
      return
    }

    let filename = options.path ?? decodeURI(c.req.path)
    console.log('Requesting file', filename);
    filename = options.rewriteRequestPath ? options.rewriteRequestPath(filename) : filename
    const root = options.root

    let path = getFilePath({
      filename,
      root,
      defaultDocument: DEFAULT_DOCUMENT,
    })

    if (!path) {
      return await next()
    }

    path = pathResolve(path);
    console.log('Resolved path', path);
    let content = await getContent(path);
    if (!content) {
      let pathWithOutDefaultDocument = getFilePathWithoutDefaultDocument({
        filename,
        root,
      });
      if (!pathWithOutDefaultDocument) {
        return await next()
      }
      pathWithOutDefaultDocument = pathResolve(pathWithOutDefaultDocument);
      content = await getContent(pathWithOutDefaultDocument);
      if (content) {
        path = pathWithOutDefaultDocument;
      }
    }

    if (!content) {
      path = pathResolve(getFilePath({
        filename: options.fallbackPath,
        root,
      })!);
      content = await getContent(path);
    }
    if (content instanceof Response) {
      return c.newResponse(content.body, content)
    }

    if (content) {
      let mimeType: string | undefined
      if (options.mimes) {
        mimeType = getMimeType(path, options.mimes) ?? getMimeType(path)
      } else {
        mimeType = getMimeType(path)
      }
      if (mimeType) {
        c.header('Content-Type', mimeType)
      }

      // Will be cached by etag
      c.header('Cache-Control', 'no-cache');
      return c.body(content)
    }

    await options.onNotFound?.(path, c)
    await next()
    return
  }
}
