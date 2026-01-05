
export const GoogleDriveService = {
  FILE_NAME: 'voucher_hub_backup.json',

  async getAccessToken(clientId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.error) reject(response);
          resolve(response.access_token);
        },
      });
      client.requestAccessToken();
    });
  },

  async findBackupFile(token: string): Promise<string | null> {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${this.FILE_NAME}' and trashed=false`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  },

  async uploadData(clientId: string, jsonData: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken(clientId);
      const fileId = await this.findBackupFile(token);

      const metadata = {
        name: this.FILE_NAME,
        mimeType: 'application/json',
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([jsonData], { type: 'application/json' }));

      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (fileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      return response.ok;
    } catch (error) {
      console.error('Drive upload failed:', error);
      return false;
    }
  },

  async downloadData(clientId: string): Promise<string | null> {
    try {
      const token = await this.getAccessToken(clientId);
      const fileId = await this.findBackupFile(token);

      if (!fileId) return null;

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      console.error('Drive download failed:', error);
      return null;
    }
  }
};
