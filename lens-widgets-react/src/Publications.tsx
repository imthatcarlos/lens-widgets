import {
  useEffect, useState
} from 'react'
import { css } from '@emotion/css'
import { client, profileByHandle } from './graphql'
import { Publication as PublicationComponent } from './Publication'
import {
  PublicationsDocument
} from './graphql/generated'
import { Theme } from './types'

export function Publications({
  profileId,
  handle,
  theme,
  publications,
  isAuthenticated = false,
  hideCommentButton = false,
  hideQuoteButton = false,
  hideShareButton = false,
  onLikeButtonClick,
} : {
  profileId?: string,
  handle?: string,
  theme?: Theme,
  publications?: any[],
  isAuthenticated?: boolean,
  hideCommentButton?: boolean,
  hideQuoteButton?: boolean,
  hideShareButton?: boolean,
  onLikeButtonClick?: (e, publicationId: string) => void,
}) {
  const [_publications, setPublications] = useState<any[] | undefined>([])

  useEffect(() => {
    if (!publications?.length) {
      fetchPublications()
    } else {
      setPublications(publications)
    }
  }, [profileId, handle, publications])

  async function fetchPublications() {
    let id = profileId
    if (!id && handle) {
      if (!handle.includes('.lens')) {
        handle = handle + '.lens'
      }
      try {
        const response = await client.query(profileByHandle, {
          handle
        }).toPromise()
        id = response.data.profile.id
      } catch (err) {
        console.log('error fetching profile: ', err)
      }
    }
    try {
      const response = await client.query(PublicationsDocument, {
        request: {
          profileId: id
        }
      }).toPromise()
      const publications = response.data?.publications?.items.filter((publication: any) => {
        if (publication.__typename !== 'Comment') {
          return true
        }
      })
      setPublications(publications)
    } catch (err) {
      console.log('error fetching publications: ', err)
    }
  }

  return (
    <div className={publicationsContainerStyle}>
      {
        publications?.map(publication => {
          return (
            <div key={`${publication.id}`} className={publicationContainerStyle}>
              <PublicationComponent
                publicationData={publication}
                publicationId={publication.id}
                theme={theme}
                isAuthenticated={isAuthenticated}
                hideCommentButton={hideCommentButton}
                hideQuoteButton={hideQuoteButton}
                hideShareButton={hideShareButton}
                onLikeButtonClick={(e) => { if(onLikeButtonClick) onLikeButtonClick(e, publication.id) }}
              />
            </div>
          )
        })
      }
    </div>
  )
}

const publicationsContainerStyle = css`
  @media (max-width: 510px) {
    width: 100%
  }
`

const publicationContainerStyle = css`
  margin-bottom: 12px;
`