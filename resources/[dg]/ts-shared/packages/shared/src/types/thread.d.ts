declare namespace Thread {
  type Mode = 'tick' | 'interval' | 'timeout';
  type Hook = 'active' | 'preStop' | 'preStart' | 'afterStop' | 'afterStart' | 'stopAborted' | 'startAborted';
}
