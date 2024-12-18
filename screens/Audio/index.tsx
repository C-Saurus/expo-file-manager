// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Text,
//   View,
//   StyleSheet,
//   Alert,
//   Linking,
//   AlertButton,
//   ActivityIndicator,
//   TouchableOpacity,
//   Button,
//   FlatList,
//   useWindowDimensions,
//   Dimensions,
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';
// import * as MediaLibrary from 'expo-media-library';
// import { styles } from './style';
// import { useAppSelector } from '../../hooks/reduxHooks';
// import { customAlbum, ExtendedAsset } from '../../types';
// import useMultiImageSelection from '../../hooks/useMultiImageSelection';
// import { AlbumList } from '../../components/Browser/PickImages/AlbumList';
// import { AssetList } from '../../components/Browser/PickImages/AssetList';
// import moment from 'moment';
// import { AssetItem } from '../../components/Browser/PickImages/AssetItem';
// import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
// import { SIZE } from '../../utils/Constants';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';

// export const AudioScreen = ({ navigation }) => {
//   const { colors } = useAppSelector((state) => state.theme.theme);
//   const renderScene = SceneMap({
//     first: AudiosByDate,
//     second: AudiosByAlbum,
//   });
//   const layout = useWindowDimensions();

//   const [index, setIndex] = useState(0);
//   const [routes] = useState([
//     { key: 'first', title: 'All' },
//     { key: 'second', title: 'Your Album' },
//   ]);

//   const renderTabBar = props => (
//     <TabBar
//       {...props}
//       indicatorStyle={{ backgroundColor: 'blue' }}
//       style={{ backgroundColor: 'white', }}
//       activeColor='blue'
//     />
//   );

//   return (
//     <TabView
//       lazy
//       renderTabBar={renderTabBar}
//       navigationState={{ index, routes }}
//       renderScene={renderScene}
//       onIndexChange={setIndex}
//       initialLayout={{ width: layout.width }}
//     />
//   );
// };

// export type selectedAlbumType = {
//   id: string;
//   title: string;
// };

// const AudiosByAlbum = () => {
//   const { colors } = useAppSelector((state) => state.theme.theme);
//   const [isMediaGranted, setIsMediaGranted] = useState<boolean | null>(null);
//   const [albums, setAlbums] = useState<customAlbum[]>([]);
//   const [albumsFetched, setAlbumsFetched] = useState(false);
//   const [selectedAlbum, setSelectedAlbum] = useState<selectedAlbumType | null>(
//     null
//   );
//   const [assets, setAssets] = useState<ExtendedAsset[]>([]);
//   const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
//   const [endCursor, setEndCursor] = useState<string | null>(null);
//   const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const isSelecting = useMultiImageSelection(assets);

//   async function getAlbums() {
//     const albums = await MediaLibrary.getAlbumsAsync();
//     const albumsPromiseArray = albums.map(
//       async (album) =>
//         await MediaLibrary.getAssetsAsync({
//           album: album,
//           mediaType: MediaLibrary.MediaType.audio,
//           first: 10,
//           sortBy: MediaLibrary.SortBy.default,
//         })
//     );
//     Promise.all(albumsPromiseArray).then((values) => {
//       const nonEmptyAlbums = values
//         .filter((item) => item.totalCount > 0)
//         .map((item) => {
//           const album = albums.find((a) => a.id === item.assets[0].albumId);
//           const albumObject: customAlbum = {
//             id: album?.id,
//             title: album?.title,
//             assetCount: album?.assetCount,
//             type: album?.type,
//           };
//           return albumObject;
//         });
//       setAlbums(nonEmptyAlbums);
//       setAlbumsFetched(true);
//     });
//   }

//   async function getAlbumAssets(albumId: string, after?: string | undefined) {
//     setLoading(true);
//     const options = {
//       album: albumId,
//       mediaType: MediaLibrary.MediaType.audio,
//       first: 25,
//       sortBy: MediaLibrary.SortBy.creationTime,
//     };
//     if (after) options['after'] = after;
//     const albumAssets = await MediaLibrary.getAssetsAsync(options);
//     setAssets((prev) => [...prev, ...albumAssets.assets]);
//     setHasNextPage(albumAssets.hasNextPage);
//     setEndCursor(albumAssets.endCursor);
//     setLoading(false);
//   }

//   const toggleSelect = (item: ExtendedAsset) => {
//     const isSelected =
//       selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
//     if (!isSelected) setSelectedAssets((prev) => [...prev, item]);
//     else
//       setSelectedAssets((prev) => [
//         ...prev.filter((asset) => asset.id != item.id),
//       ]);
//     setAssets(
//       assets.map((i) => {
//         if (item.id === i.id) {
//           i.selected = !i.selected;
//         }
//         return i;
//       })
//     );
//   };

//   // const unSelectAll = () => {
//   //   setAssets(
//   //     assets.map((i) => {
//   //       i.selected = false;
//   //       return i;
//   //     })
//   //   );
//   // };

//   useEffect(() => {
//     const requestMediaPermission = async () => {
//       MediaLibrary.requestPermissionsAsync()
//         .then((result) => {
//           setIsMediaGranted(result.granted);
//           if (!result.granted || result.accessPrivileges === 'limited') {
//             const alertOptions: AlertButton[] = [
//               {
//                 text: 'Go to App Settings',
//                 onPress: () => {
//                   Linking.openSettings();
//                 },
//               },
//               {
//                 text: 'Nevermind',
//                 onPress: () => { },
//                 style: 'cancel',
//               },
//             ];
//             if (result.canAskAgain && result.accessPrivileges !== 'limited')
//               alertOptions.push({
//                 text: 'Request again',
//                 onPress: () => requestMediaPermission(),
//               });
//             Alert.alert(
//               'Denied Media Access',
//               'App needs access to all media library',
//               [...alertOptions]
//             );
//           }
//           if (result.granted) getAlbums();
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     };
//     requestMediaPermission();
//     console.log('AudiosByAlbum');
//   }, []);

//   useEffect(() => {
//     if (selectedAlbum) getAlbumAssets(selectedAlbum.id);
//   }, [selectedAlbum]);

//   if (!isMediaGranted && isMediaGranted !== null)
//     return (
//       <View
//         style={{
//           ...styles.noAccessContainer,
//           backgroundColor: colors.background,
//         }}
//       >
//         <Text style={{ ...styles.noAccessText, color: colors.primary }}>
//           {'Media Access Denied'}
//         </Text>
//         <Button title="Go to Settings" onPress={() => Linking.openSettings()} />
//       </View>
//     );

//   if (!albumsFetched)
//     return (
//       <View
//         style={{
//           ...styles.container,
//           backgroundColor: colors.background2,
//           width: '100%',
//         }}
//       >
//         <ActivityIndicator size="large" color={colors.primary} />
//       </View>
//     );

//   if (albumsFetched && albums.length === 0)
//     return (
//       <View
//         style={{ ...styles.container, backgroundColor: colors.background2 }}
//       >
//         <Text style={{ color: colors.text, fontFamily: 'Poppins_600SemiBold' }}>
//           No Albums Found
//         </Text>
//       </View>
//     );

//   return (
//     <View style={{ ...styles.container, backgroundColor: colors.background2 }}>
//       <View style={styles.header}>
//         <View>
//           {selectedAlbum?.title && (
//             <Text style={{ ...styles.title, color: colors.primary }}>
//               {selectedAlbum?.title}
//             </Text>
//           )}
//         </View>
//         <View style={styles.backButtonContainer}>
//           {selectedAlbum && (
//             <TouchableOpacity
//               onPress={() => {
//                 setSelectedAlbum(null);
//                 setAssets([]);
//                 setSelectedAssets([]);
//               }}
//             >
//               <Feather name="chevron-left" size={32} color={colors.primary} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//       <View style={styles.listContainer}>
//         {albumsFetched && !selectedAlbum && (
//           <AlbumList albums={albums} setSelectedAlbum={setSelectedAlbum} />
//         )}
//         {selectedAlbum && (
//           <AssetList
//             assets={assets}
//             albumId={selectedAlbum.id}
//             getAlbumAssets={getAlbumAssets}
//             hasNextPage={hasNextPage}
//             endCursor={endCursor}
//             toggleSelect={toggleSelect}
//             isSelecting={isSelecting}
//             loading={loading}
//           />
//         )}
//       </View>
//     </View>
//   );
// };

// const AudiosByDate = () => {
//   const { colors } = useAppSelector((state) => state.theme.theme);
//   const [assets, setAssets] = useState<ExtendedAsset[]>([]);
//   const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
//   const [endCursor, setEndCursor] = useState<string | null>(null);
//   const [selectedAssets, setSelectedAssets] = useState<ExtendedAsset[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [visible, setVisible] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const isSelecting = useMultiImageSelection(assets);
//   const navigation = useNavigation<StackNavigationProp<any>>();
//   const [groupedAudios, setGroupedAudios] = useState<{
//     [key: string]: ExtendedAsset[];
//   }>({});
//   const currentImageSize = useRef<number>(0);

//   async function getAlbumAssets(after?: string) {
//     console.log('Fetching assets...');
//     currentImageSize.current = assets.length;
//     setLoading(true);
//     const options = {
//       first: 4,
//       mediaType: MediaLibrary.MediaType.audio,
//       sortBy: MediaLibrary.SortBy.creationTime,
//     };
//     if (after) options['after'] = after;
//     const albumAssets = await MediaLibrary.getAssetsAsync(options);
//     console.log('albumAssets');
//     // Cập nhật assets mới mà không cần nhóm lại
//     setAssets((prev) => [...prev, ...albumAssets.assets]);
//     setHasNextPage(albumAssets.hasNextPage);
//     setEndCursor(albumAssets.endCursor);
//     setLoading(false);
//   }

//   useEffect(() => {
//     getAlbumAssets();
//     return () => {
//       setAssets([]);
//       setGroupedAudios({});
//     };
//   }, []);

//   useEffect(() => {
//     if (assets.length > 0) {
//       groupAudiosByDate(); // Gọi hàm này chỉ khi assets thay đổi
//     }
//   }, [assets]);

//   const groupAudiosByDate = () => {
//     const newImage = assets.length - currentImageSize.current;
//     const newGroupedAudios = { ...groupedAudios }; // Tạo bản sao của groupedAudios
//     const newAudios =
//       newImage > 0 ? assets.slice(currentImageSize.current) : assets;

//     newAudios.forEach((photo) => {
//       const date = moment(photo.creationTime).format('DD/MM/YYYY');
//       if (!newGroupedAudios[date]) {
//         newGroupedAudios[date] = [];
//       }
//       newGroupedAudios[date].push(photo);
//     });
//     setGroupedAudios(newGroupedAudios);
//   };

//   const toggleSelect = (item: ExtendedAsset, multiSelectEmit?: boolean) => {
//     if (multiSelectEmit) {
//       const isSelected =
//         selectedAssets.findIndex((asset) => asset.id === item.id) !== -1;
//       if (!isSelected) {
//         setSelectedAssets((prev) => [...prev, item]);
//       } else {
//         setSelectedAssets((prev) =>
//           prev.filter((asset) => asset.id !== item.id)
//         );
//       }
//     } else {
//       openModal(item);
//     }
//     // setAssets((prev) =>
//     //   prev.map((i) => {
//     //     if (item.id === i.id) {
//     //       i.selected = !i.selected;
//     //     }
//     //     return i;
//     //   })
//     // );
//   };

//   const openModal = (item) => {
//     navigation.push('AudioPlayer', {
//       filename: item.filename,
//       uri: item.uri
//     });
//   };

//   const renderPhotoItem = useCallback(
//     ({ item }) =>
//       item?.id ? (
//         <AssetItem
//           item={item}
//           toggleSelect={toggleSelect}
//           isSelecting={selectedAssets.some((asset) => asset.id === item.id)}
//         />
//       ) : (
//         <View style={styles.emptyItem}></View>
//       ),
//     [selectedAssets]
//   );

//   const renderGroup = ({ item: { date, audios } }) => (
//     <View style={styles.dateGroup}>
//       <Text style={styles.dateTitle}>{date}</Text>
//       <FlatList
//         data={audios.length >= 3 ? audios : [...audios, {}, {}].slice(0, 3)}
//         renderItem={renderPhotoItem}
//         keyExtractor={(item) => item.id + item.creationTime + item.name}
//         numColumns={3}
//       />
//     </View>
//   );

//   const renderFooter = () => {
//     if (loading) {
//       return (
//         <View
//           style={{
//             flex: 1,
//             alignItems: 'center',
//             justifyContent: 'center',
//             backgroundColor: colors.background2,
//             width: '100%',
//           }}
//         >
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       )
//     }
//     return null;
//   };

//   const groupedData = Object.entries(groupedAudios).map(([date, audios]) => ({
//     date,
//     audios,
//   }));

//   return (
//     <View style={{ ...styles.container, backgroundColor: colors.background2 }}>
//       <FlatList
//         data={groupedData}
//         renderItem={renderGroup}
//         keyExtractor={(item) => item.date}
//         onEndReached={() => {
//           if (hasNextPage) getAlbumAssets(endCursor); // Tải thêm ảnh nếu có
//         }}
//         fadingEdgeLength={3}
//         onEndReachedThreshold={0.9}
//         ListFooterComponent={renderFooter}
//       />
//     </View>
//   );
// };
