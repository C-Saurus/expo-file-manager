import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Entypo } from '@expo/vector-icons';
import { fetchFiles } from '../../stores/document/action';
import { TabDocFiles } from './list';
import { sortByOption } from '../../stores/document/reducer';
import { DisplayOptionModal } from '../../components/Modals/DisplayOptionModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { SIZE } from '../../utils/Constants';

export const DocumentScreen: React.FC<any> = React.memo(({ navigation }) => {
  const [openOption, setOpenOption] = useState(false);
  const [sortOption, setSortOption] = useState(0);
  const [searchValue, setSearchValue] = useState<string | undefined>();
  const [index, setIndex] = useState(0);
  const { top } = useSafeAreaInsets();
  const [routes] = useState([
    { key: 'doc', title: 'Doc' },
    { key: 'sheet', title: 'CSV/Excel' },
  ]);
  const { colors } = useAppSelector((state) => state.theme.theme);

  const layout = useWindowDimensions();

  const handleChooseOption = useCallback(() => {
    setOpenOption((prev) => !prev);
  }, []);

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case 'doc':
          return (
            <TabDocFiles
              fileType={'doc'}
              sortOption={sortOption}
              searchValue={searchValue}
              setParentSortOption={setOpenOption}
            />
          );
        case 'sheet':
          return (
            <TabDocFiles
              fileType={'csvExcel'}
              sortOption={sortOption}
              searchValue={searchValue}
              setParentSortOption={setOpenOption}
            />
          );
        default:
          return null;
      }
    },
    [sortOption, searchValue]
  );

  const renderTabBar = useCallback(
    (props) => (
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: 'tomato' }}
        style={{ backgroundColor: colors.background }}
        activeColor={'tomato'}
        inactiveColor={colors.text}
      />
    ),
    [colors]
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleSort = (value: number) => {
    setSortOption(value);
  };

  const onBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log('Cannot go back, you are on the root screen.');
    }
  };

  return (
    <View
      style={{
        paddingTop: top,
        flex: 1,
        width: SIZE,
        backgroundColor: colors.background,
      }}
    >
      <Header
        colors={colors}
        handleChooseOption={handleChooseOption}
        headerTitle={'Document'}
        onBackPress={onBackPress}
        handleSearch={handleSearch}
      />
      <TabView
        lazy={true}
        lazyPreloadDistance={1}
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

      <DisplayOptionModal
        openOption={openOption}
        setOpenOption={setOpenOption}
        handleSort={handleSort}
      />
    </View>
  );
});
