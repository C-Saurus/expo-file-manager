// import {
//     RouteProp,
//     useNavigation,
//     useRoute,
//     useIsFocused,
//     NavigationProp,
//   } from '@react-navigation/native';
//   import { useCallback, useEffect, useRef, useState } from 'react';
//   import {
//     ActivityIndicator,
//     Image,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
//   } from 'react-native';
//   import AwesomeGallery, {
//     GalleryRef,
//     RenderItemInfo,
//   } from 'react-native-awesome-gallery';
//   import * as React from 'react';
//   import Animated, {
//     FadeInDown,
//     FadeInUp,
//     FadeOutDown,
//     FadeOutUp,
//   } from 'react-native-reanimated';
//   import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { ExtendedAsset } from '../../types';
// import * as MediaLibrary from 'expo-media-library';
  
//   const renderItem = ({
//     item,
//     setImageDimensions,
//   }: RenderItemInfo<{ uri: string }>) => {
//     return (
//       <Image
//         source={{ uri: item.uri }}
//         style={StyleSheet.absoluteFillObject}
//         resizeMode="contain"
//         onLoad={(e: any) => {
//           const { width, height } = e.source;
//           setImageDimensions({ width, height });
//         }}
//       />
//     );
//   };
  
//   export const CustomeImage = () => {
//     const { top, bottom } = useSafeAreaInsets();
//     const { setParams, goBack } = useNavigation();
//     const isFocused = useIsFocused();
//     const { params } = useRoute();
//     const gallery = useRef<GalleryRef>(null);
//     const [mounted, setMounted] = useState(false);

//     const [assets, setAssets] = useState<ExtendedAsset[]>([]);
//     const [hasNextPage, setHasNextPage] = useState<boolean | null>(null);
//     const [endCursor, setEndCursor] = useState<string | null>(null);
//     const [loading, setLoading] = useState<boolean>(false);
//     const [selectedIndex, setSelectedIndex] = useState<number>(0)

//     async function getAlbumAssets(after?: string) {
//       console.log('Fetching assets...');
//       setLoading(true);
//       const options = {
//         first: 25,
//         sortBy: MediaLibrary.SortBy.creationTime,
//       };
//       if (after) options['after'] = after;
//       const albumAssets = await MediaLibrary.getAssetsAsync(options);
      
//       // Cập nhật assets mới mà không cần nhóm lại
//       setAssets((prev) => [...prev, ...albumAssets.assets]);
//       setHasNextPage(albumAssets.hasNextPage);
//       setEndCursor(albumAssets.endCursor);
//       setLoading(false);
//     }
  
//     useEffect(() => {
//       getAlbumAssets();
//       return () => {
//         setAssets([]);
//       };
//     }, []);
  
//     useEffect(() => {
//       setMounted(true);
//     }, []);
  
//     const [infoVisible, setInfoVisible] = useState(true);
  
//     useEffect(() => {
//       StatusBar.setBarStyle(isFocused ? 'light-content' : 'dark-content', true);
//       if (!isFocused) {
//         StatusBar.setHidden(false, 'fade');
//       }
//     }, [isFocused]);
  
//     const onIndexChange = useCallback(
//       (index: number) => {
//         isFocused && setSelectedIndex(selectedIndex);
//       },
//       [isFocused, setParams]
//     );
  
//     const onTap = () => {
//       StatusBar.setHidden(infoVisible, 'slide');
//       setInfoVisible(!infoVisible);
//     };

//     const renderFooter = () => {
//       if (loading) {
//         return (
//           <View
//             style={{
//               ...styles.container,
//               width: '100%',
//             }}
//           >
//             <ActivityIndicator size="large" />
//           </View>
//         );
//       }
//       return null;
//     };
  
//     return (
//       <View style={styles.container}>
//         {infoVisible && (
//           <Animated.View
//             entering={mounted ? FadeInUp.duration(250) : undefined}
//             exiting={FadeOutUp.duration(250)}
//             style={[
//               styles.toolbar,
//               {
//                 height: top + 60,
//                 paddingTop: top,
//               },
//             ]}
//           >
//             <View style={styles.textContainer}>
//               <Text style={styles.headerText}>
//                 {selectedIndex + 1} of {assets.length}
//               </Text>
//             </View>
//           </Animated.View>
//         )}
//         <AwesomeGallery
//           ref={gallery}
//           data={assets}
//           keyExtractor={(item) => item.uri}
//           renderItem={renderItem}
//           initialIndex={selectedIndex}
//           numToRender={3}
//           doubleTapInterval={150}
//           onIndexChange={onIndexChange}
//           onSwipeToClose={goBack}
//           onTap={onTap}
//           loop
//           onScaleEnd={(scale) => {
//             if (scale < 0.8) {
//               goBack();
//             }
//           }}
//         />
//         {infoVisible && (
//           <Animated.View
//             entering={mounted ? FadeInDown.duration(250) : undefined}
//             exiting={FadeOutDown.duration(250)}
//             style={[
//               styles.toolbar,
//               styles.bottomToolBar,
//               {
//                 height: bottom + 100,
//                 paddingBottom: bottom,
//               },
//             ]}
//           >
//             <View style={styles.buttonsContainer}>
//               <TouchableOpacity
//                 style={styles.textContainer}
//                 onPress={() =>
//                   gallery.current?.setIndex(
//                     selectedIndex === 0
//                       ? assets.length - 1
//                       : selectedIndex - 1
//                   )
//                 }
//               >
//                 <Text style={styles.buttonText}>Previous</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.textContainer}
//                 onPress={() =>
//                   gallery.current?.setIndex(
//                     selectedIndex === assets.length - 1
//                       ? 0
//                       : selectedIndex + 1,
//                     true
//                   )
//                 }
//               >
//                 <Text style={styles.buttonText}>Next</Text>
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         )}
//       </View>
//     );
//   };
  
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//     },
//     textContainer: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     buttonText: {
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: 'white',
//     },
//     buttonsContainer: {
//       flex: 1,
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//     },
//     toolbar: {
//       position: 'absolute',
//       width: '100%',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       zIndex: 1,
//     },
//     bottomToolBar: {
//       bottom: 0,
//     },
//     headerText: {
//       fontSize: 16,
//       color: 'white',
//       fontWeight: '600',
//     },
//   });