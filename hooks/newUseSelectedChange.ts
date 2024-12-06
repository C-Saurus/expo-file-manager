import { useState, useEffect } from 'react';
import { ReadDirItem } from 'react-native-fs';

export default function useNewSelectionChange(
  items: ReadDirItem[],
  selectedFile: ReadDirItem[]
) {
  const [multiSelect, setMultiSelect] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    if (selectedFile.length > 0) {
      setMultiSelect(true);
    } else {
      setMultiSelect(false);
    }
    if (selectedFile.length === items.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [items, selectedFile]);
  return { multiSelect, allSelected };
}
