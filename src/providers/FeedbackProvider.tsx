import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { ZodError } from 'zod';
import { message } from '@/src/lib/errors';
const Context=createContext<(text:string,error?:boolean)=>void>(()=>undefined);
export function FeedbackProvider({children}:PropsWithChildren) {
 const [notice,setNotice]=useState<{text:string;error?:boolean}|null>(null);const insets=useSafeAreaInsets();
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(null),notice.error?9000:4000);return()=>clearTimeout(timer);},[notice]);
 return <Context.Provider value={(text,error)=>setNotice({text,error})}>{children}{notice&&<View style={{bottom:insets.bottom+16}} className="absolute left-4 right-4 rounded-2xl bg-foreground p-4"><Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={()=>setNotice(null)}><Text accessibilityLiveRegion="polite" className="text-base leading-6 text-white">{notice.text}  ×</Text></Pressable></View>}</Context.Provider>;
}
export function useAction() {
 const notify=useContext(Context), cache=useQueryClient(),[busy,setBusy]=useState(false);
 async function run<T>(action:()=>Promise<T>,success?:string) {
  if(busy)return;
  setBusy(true);
  try { const result=await action();await cache.invalidateQueries();if(success)notify(success);return {result}; }
  catch(error) {notify(error instanceof ZodError?error.issues.map(i=>i.message).join('\n'):message(error),true);return undefined;}
  finally {setBusy(false);}
 }
 return {run,busy,notify};
}
