import {Image} from 'react-native';
import {FileSystem, Dirs} from 'react-native-file-access';

export async function loadFile(resourceId: number) {
  const uri = Image.resolveAssetSource(resourceId).uri;

  let resourcePath: string | undefined = undefined;
  if (uri.startsWith('http')) {
    resourcePath = Dirs.CacheDir + '/resource-' + resourceId;
    // fetch file from dev server every time
    await FileSystem.fetch(uri, {
      path: resourcePath,
    });
  } else {
    resourcePath = Dirs.CacheDir + '/' + uri;
    if (!(await FileSystem.exists(resourcePath))) {
      await FileSystem.cpAsset('raw/' + uri, resourcePath, 'resource');
    }
  }

  let content = await FileSystem.readFile(resourcePath, 'utf8');

  return content;
}
