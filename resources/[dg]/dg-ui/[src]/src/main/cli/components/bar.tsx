import React, { useEffect, useState } from 'react';

import { Input } from '../../../components/inputs';
import { mockEvent } from '../../../lib/nui-comms';
import { cmds } from '../commands';

export const Bar: React.FC = () => {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const realCmds = cmds.map(cmd => {
    // remove all $x and leading/trailing spaces
    return {
      name: cmd.cmd.replace(/\$\d+/g, '').trim(),
      cmd: cmd,
    };
  });
  const autocompleteOpt = cmds.map(c => {
    const newCmd = c.cmd.replace(/\$\d+/g, (match: string) => {
      if (!c.data) {
        return '';
      }
      const loopEntries = (data: any) => {
        let val = '';
        Object.entries(data).forEach(([key, value]) => {
          let loopVal = '';
          if (typeof value === 'object') {
            loopVal = loopEntries(value);
          }
          if (loopVal.trim() !== '') {
            val = loopVal;
            return val;
          }
          if (value === match) {
            val = `$${key}`;
          }
        });
        return val;
      };
      return loopEntries(c.data);
    });
    return {
      value: newCmd,
      label: newCmd,
    };
  });

  const setReplacer = (data: any, arg: string, idx: number): any => {
    const _data = { ...data };
    Object.entries(_data).forEach(([key, val]) => {
      if (typeof val === 'object' && !Array.isArray(val)) {
        _data[key] = setReplacer(val, arg, idx);
      }
      if (val === `$${idx + 1}`) {
        _data[key] = arg.replace(/^'(.*)'$/, '$1');
      }
    });
    return _data;
  };

  const doCmd = () => {
    const cmdInfo = realCmds.find(cmd => {
      return value.startsWith(cmd.name);
    });
    if (!cmdInfo) {
      console.log(`no cmd found for ${value}`);
      return;
    }
    const args = value.replace(cmdInfo.name, '').trim();
    if (!cmdInfo.cmd.data) {
      cmdInfo.cmd.data = {};
    }
    let parsedData = cmdInfo.cmd.data ?? {};
    if (args) {
      args.split(/(?<!'[^']+) (?![^' ]+')/).forEach((arg, idx) => {
        parsedData = setReplacer(parsedData, arg, idx);
      });
    }
    const extraData: Record<string, any> = {};
    if (cmdInfo.cmd.show !== undefined) {
      extraData.show = cmdInfo.cmd.show;
    }
    if (cmdInfo.cmd.hide !== undefined) {
      extraData.show = cmdInfo.cmd.hide;
    }
    mockEvent(cmdInfo.cmd.app, parsedData, extraData);
  };

  const onChange = (val: string) => {
    setValue(val);
  };
  const keyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      doCmd();
      const newHistory = [...history, value].slice(-5);
      localStorage.setItem('cli-history', newHistory.join('|'));
      setHistory(newHistory);
    }
  };

  useEffect(() => {
    setHistory(localStorage.getItem('cli-history')?.split('|') ?? []);
  }, []);

  return (
    <div className={'cli_bar'}>
      <Input.AutoComplete
        name='cmd'
        label='Command'
        value={value}
        freeSolo
        onChange={onChange}
        onKeyDown={keyPress}
        options={history.map(h => ({ label: h, value: h })).concat(autocompleteOpt)}
      />
    </div>
  );
};
