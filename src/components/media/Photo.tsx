import { Image, Text, View } from 'react-native';
import { useState } from 'react';
export function Photo({uri,height=260}:{uri:string;height?:number}){
 const [failed,setFailed]=useState(false);
 return <View style={{height}} className="overflow-hidden rounded-card bg-sage">{failed?<View className="flex-1 items-center justify-center"><Text className="text-primary">A place worth picturing ✳</Text></View>:<Image accessible={false} source={{uri}} resizeMode="cover" onError={()=>setFailed(true)} style={{width:'100%',height:'100%'}} />}</View>;
}
