
export function format(str: string, args?: any[]) {
  if (args) {
    for (let i = 0; i < args.length; ++i) {
      str = str.replace(new RegExp(`\\{${i}\\}`, 'g'), args[i]);
    }
  }

  return str;
}
