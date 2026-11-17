import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import type { LocalPhoto } from './clustering';
const photoSchema=z.object({id:z.string(),uri:z.string(),capturedAt:z.number(),latitude:z.number().nullable(),longitude:z.number().nullable()});
export const memorySchema=z.object({id:z.string(),title:z.string().trim().min(1).max(120),location:z.string().trim().min(1).max(150),tripId:z.string().nullable(),journal:z.string().max(10000),photos:z.array(photoSchema),createdAt:z.string()});
export type LocalMemory=z.infer<typeof memorySchema>;
const key=(user:string)=>'wayfarer:memories:'+user;
export const memoryRepository={
 async list(user:string):Promise<LocalMemory[]>{const data=await AsyncStorage.getItem(key(user));return data?z.array(memorySchema).parse(JSON.parse(data)):[];},
 async save(user:string,memory:LocalMemory){const all=await this.list(user);const validated=memorySchema.parse(memory);await AsyncStorage.setItem(key(user),JSON.stringify([validated,...all.filter(m=>m.id!==memory.id)]));},
 async remove(user:string,id:string){await AsyncStorage.setItem(key(user),JSON.stringify((await this.list(user)).filter(m=>m.id!==id)));},
 async scanState(user:string):Promise<{photos:LocalPhoto[];cursor?:string;done?:boolean}> {const data=await AsyncStorage.getItem(key(user)+':scan');return data?z.object({photos:z.array(photoSchema),cursor:z.string().optional(),done:z.boolean().optional()}).parse(JSON.parse(data)):{photos:[]};},
 async saveScan(user:string,state:{photos:LocalPhoto[];cursor?:string;done?:boolean}){await AsyncStorage.setItem(key(user)+':scan',JSON.stringify(state));},
 async clearScan(user:string){await AsyncStorage.removeItem(key(user)+':scan');},
};
