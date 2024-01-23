export type ComboResult = {
  success: boolean;
  url: string;
  username: string;
  password: string;
};

export class ComboParser {
  private searchValue: string;

  constructor(
    searchValue: string = "",
    private minPasswordLength: number = 4,
  ) {
    this.searchValue = searchValue.toLowerCase();
  }

  public parse(text: string): ComboResult {
    const [url, username, password] = this.weakParse(text);
    const success = url.toLowerCase().includes(this.searchValue) && password.length >= this.minPasswordLength;

    return { success, url, username, password };
  }

  private weakParse(text: string): string[] {
    text = text.trim();
    text = text.replace("://", "__u__");
    text = text.replace(" ", ":");

    const splitedText = text.split(":");

    if (splitedText.length >= 3) {
      const maybeUrl = splitedText[0].replace("__u__", "://");
      const maybeUsername = splitedText[1];
      const maybePassword = splitedText.slice(2).join(":");

      return [
        maybeUrl,
        maybeUsername,
        maybePassword,
      ];
    }

    return ["", "", ""];
  }
}

