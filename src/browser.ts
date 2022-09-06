import Patcher from "./Patcher";
import PreparedPatchFile from "./PreparedPatchFile";
import {crc32} from './utils/crc';
import { BPSPattern } from "./patterns/BPSPattern";
import {IPSPattern} from "./patterns/IPSPattern";
import {UPSPattern} from "./patterns/UPSPattern";

(window as any).Patcher_Patcher = Patcher;
(window as any).Patcher_PreparedPatchFile = PreparedPatchFile;
(window as any).Patcher_crc32 = crc32;

(window as any).Patcher_Pattern_BPSPattern = BPSPattern;
(window as any).Patcher_Pattern_IPSPattern = IPSPattern;
(window as any).Patcher_Pattern_UPSPattern = UPSPattern;
