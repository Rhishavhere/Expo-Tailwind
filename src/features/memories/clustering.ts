export type LocalPhoto={ id:string; uri:string; capturedAt:number; latitude:number|null; longitude:number|null };
export type PhotoGroup={ key:string; date:string; latitude:number|null; longitude:number|null; photos:LocalPhoto[] };
export function distanceKm(a:{latitude:number;longitude:number},b:{latitude:number;longitude:number}){
 const radians=(n:number)=>n*Math.PI/180,dlat=radians(b.latitude-a.latitude),dlon=radians(b.longitude-a.longitude);
 const h=Math.sin(dlat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dlon/2)**2;
 return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
}
export function clusterPhotos(photos:LocalPhoto[],radiusKm=3):PhotoGroup[]{
 const groups:PhotoGroup[]=[];
 for(const photo of [...photos].sort((a,b)=>a.capturedAt-b.capturedAt||a.id.localeCompare(b.id))){
 const date=new Date(photo.capturedAt).toISOString().slice(0,10),hasGps=photo.latitude!==null&&photo.longitude!==null;
 let group=groups.find(g=>g.date===date&&(hasGps?(g.latitude!==null&&g.longitude!==null&&distanceKm({latitude:photo.latitude!,longitude:photo.longitude!},{latitude:g.latitude,longitude:g.longitude})<=radiusKm):(g.latitude===null)));
 if(!group){group={key:date+':'+groups.length,date,latitude:photo.latitude,longitude:photo.longitude,photos:[]};groups.push(group);}
 group.photos.push(photo);
 }return groups;
}
