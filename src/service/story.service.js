import axios from "axios";
import { Subject } from "rxjs";

export default class StoryService{
    http = axios.create({
        baseURL: "http://localhost:3000"
    })

    subjectMeta = new Subject();
    subjectStory = new Subject();

    getMeta(){
        return this.http.get("/meta", {responseType: 'json', headers: {"Content-Type": "application/json"}})
        .then((res)=>{
            this.subjectMeta.next(res.data);
        })
        .catch((error)=>{
            console.log(error)
        })
    }

    getStory(id){
        return this.http.get(`/story/${id}`, {responseType: 'json', headers: {"Content-Type": "application/json"}})
        .then((res)=>{
            this.subjectStory.next(res.data);
        })
        .catch((error)=>{
            console.log(error)
        })
    }


}