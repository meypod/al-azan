import {Image} from 'react-native';
import {FileSystem, Dirs} from 'react-native-file-access';

export async function loadFile(resourceId: number) {
  const uri = Image.resolveAssetSource(resourceId).uri;

  let resourcePath: string | undefined = undefined;
  if (uri.startsWith('http')) {
    resourcePath = Dirs.CacheDir + '/resource-' + resourceId;
    await FileSystem.fetch(uri, {
      path: resourcePath,
    });
  }

  return FileSystem.readFile(resourcePath ? resourcePath : uri);
}
