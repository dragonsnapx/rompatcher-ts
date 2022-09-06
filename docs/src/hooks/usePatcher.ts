import { useRef } from "react";
import Patcher from "../../../src/Patcher";
import { IPSPattern } from "../../../src/patterns/IPSPattern";
import { BPSPattern } from "../../../src/patterns/BPSPattern";
import { UPSPattern } from "../../../src/patterns/UPSPattern";

function usePatcher() {
  const patcherRef = useRef<Patcher>();
  if (!patcherRef.current) {
    patcherRef.current = new Patcher([
      new IPSPattern(),
      new BPSPattern(),
      new UPSPattern(),
    ]);
  }
  return patcherRef.current;
}

export default usePatcher;
