import {useEffect, useRef, useState} from 'react';
import {loadFile} from '@/utils/load_file';

/**
 * returns file lines as a string array
 * @param resourceId - an id returned by require()
 */
function useFileLines(resourceId: number): string[] {
  const [fileLines, setFileLines] = useState([] as string[]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    loadFile(resourceId).then(fileContent => {
      if (isMountedRef.current) {
        setFileLines(fileContent.trim().split('\n'));
      }
    });

    return () => {
      isMountedRef.current = false;
      setFileLines([]);
    };
  }, [resourceId]);

  return fileLines;
}

export default useFileLines;
