import React, { useState } from 'react';
import '../video_list/videolist.css';
const VideoList = ({ videos }) => {
  const [videoList, setVideoList] = useState(videos);

  // Toggle active status of the video
  const handleActiveToggle = (id) => {
    setVideoList((prevVideos) =>
      prevVideos.map((video) =>
        video.id === id
          ? { ...video, is_active: video.is_active === 1 ? 0 : 1 }
          : video
      )
    );
  };

  // Delete a video
  const handleDelete = (id) => {
    setVideoList((prevVideos) => prevVideos.filter((video) => video.id !== id));
  };

  // Optional: play video in iframe (for demonstration purposes)
  const renderVideoPlayer = (videoLink) => {
    return (
      <div className="video-player">
        <h3>Video Player</h3>
        <iframe
          width="560"
          height="315"
          src={videoLink}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="video"
        ></iframe>
      </div>
    );
  };

  return (
    <div className="video-list">
      <h1>Video List</h1>
      <table>
        <thead>
          <tr>
            <th>Video</th>
            <th>Is Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {videoList.map((video) => (
            <tr key={video.id}>
              <td>
                <a href={video.video_link} target="_blank" rel="noopener noreferrer">
                  {video.file_name}
                </a>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={video.is_active === 1}
                  onChange={() => handleActiveToggle(video.id)}
                />
              </td>
              <td>
                <button onClick={() => handleDelete(video.id)}>Delete</button>
                <button>
                  <a href={video.video_link} target="_blank" rel="noopener noreferrer">
                    View Video
                  </a>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoList;
