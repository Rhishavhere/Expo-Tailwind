import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { memoryRepository } from './memory-repository';
import type { LocalPhoto } from './clustering';
export async function scanNextPage(user:string){
 const permission=await MediaLibrary.requestPermissionsAsync(false,['photo']);
 if(!permission.granted)throw new Error('Photo permission was denied. You can choose individual photos instead and keep using the rest of the app.');
 const state=await memoryRepository.scanState(user);
 if(state.done)return {...state,skipped:0};
 const page=await MediaLibrary.getAssetsAsync({first:40,after:state.cursor,mediaType:['photo'],sortBy:[[MediaLibrary.SortBy.creationTime,false]]});
 const photos:LocalPhoto[]=[];let skipped=0;
 for(const asset of page.assets){
  try{const info=await MediaLibrary.getAssetInfoAsync(asset,{shouldDownloadFromNetwork:false});photos.push({id:asset.id,uri:info.localUri??asset.uri,capturedAt:asset.creationTime,latitude:info.location?.latitude??null,longitude:info.location?.longitude??null});}catch{skipped++;}
 }
 const merged=[...new Map([...state.photos,...photos].map(p=>[p.id,p])).values()];
 const next={photos:merged,cursor:page.endCursor,done:!page.hasNextPage};await memoryRepository.saveScan(user,next);
 return {...next,skipped};
}
export async function pickPhotos():Promise<LocalPhoto[]>{
 const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsMultipleSelection:true,selectionLimit:30,exif:true,quality:0.5});
 if(result.canceled)return [];
 return result.assets.map((asset,index)=>({
  id:asset.assetId??asset.uri+index,uri:asset.uri,capturedAt:Date.now(),
  latitude:typeof asset.exif?.GPSLatitude==='number'?asset.exif.GPSLatitude:null,
  longitude:typeof asset.exif?.GPSLongitude==='number'?asset.exif.GPSLongitude:null,
 }));
}
