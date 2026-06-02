interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: { credential: string }) => void
      }) => void
      prompt: (
        callback?: (notification: {
          isNotDisplayed: () => boolean
          isSkippedMoment: () => boolean
        }) => void
      ) => void
    }
    oauth2: {
      initTokenClient: (config: {
        client_id: string
        scope: string
        callback: (response: { access_token: string; error?: string }) => void
      }) => { requestAccessToken: () => void }
    }
  }
}

interface Window {
  google: GoogleIdentityServices
}
