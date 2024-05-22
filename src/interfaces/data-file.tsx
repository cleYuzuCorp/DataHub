import { Exist } from "./exist"

export interface DataFile {
    Domain: string
    Email: string
    Name: string
    Exist: Array<Exist>
    Status: string
}