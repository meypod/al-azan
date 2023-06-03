import {Buffer} from 'buffer';
import decompress from 'brotli/decompress';
import {Image} from 'react-native';
import {FileSystem, Dirs} from 'react-native-file-access';

async function decompressFileInPlace(path: string) {
  let content = await FileSystem.readFile(path, 'base64');
  content = Buffer.from(decompress(Buffer.from(content, 'base64'))).toString(
    'utf-8',
  );
  try {
    await FileSystem.unlink(path);
  } catch (e) {
    console.error(e);
  }
  await FileSystem.writeFile(path, content, 'utf8');
  return content;
}

export async function loadFile(resourceId: number, compressed = false) {
  const uri = Image.resolveAssetSource(resourceId).uri;

  let resourcePath: string | undefined = undefined;
  if (uri.startsWith('http')) {
    resourcePath = Dirs.CacheDir + '/resource-' + resourceId;
    if (!(await FileSystem.exists(resourcePath))) {
      await FileSystem.fetch(uri, {
        path: resourcePath,
      });
      if (compressed) {
        await decompressFileInPlace(resourcePath);
      }
    }
  } else {
    resourcePath = Dirs.CacheDir + '/' + uri;
    if (!(await FileSystem.exists(resourcePath))) {
      await FileSystem.cpAsset(uri, resourcePath);
      if (compressed) {
        await decompressFileInPlace(resourcePath);
      }
    }
  }

  let content = await FileSystem.readFile(resourcePath, 'utf8');

  return content;
}
