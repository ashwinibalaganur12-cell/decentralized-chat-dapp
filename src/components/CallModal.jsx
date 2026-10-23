import React, { useEffect, useState, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Video, VideoOff, Lock } from 'lucide-react';
import './CallModal.css';

const CallModal = ({ isOpen, contact, onEndCall, isVideoCall, callUrl }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false); // Default to false to prevent audio call flash
    const [isSpeakerOn, setIsSpeakerOn] = useState(false);
    const audioContextRef = useRef(null);
    const oscillatorsRef = useRef([]);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Initialize video state based on call type
    useEffect(() => {
        if (isOpen) {
            setIsVideoOn(!!isVideoCall);
        }
    }, [isOpen, isVideoCall]);

    // Camera Stream logic
    useEffect(() => {
        const startCamera = async () => {
            if (isOpen && isVideoOn) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    toast.error("Could not access camera. Please check permissions.");
                    // Fallback if camera fails
                    setIsVideoOn(false);
                }
            }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };

        if (isOpen && isVideoCall && isVideoOn) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, isVideoOn]);

    // Sound generation effect
    useEffect(() => {
        if (isOpen) {
            startRinging();
        } else {
            stopRinging();
        }

        return () => {
            stopRinging();
        };
    }, [isOpen]);

    const startRinging = () => {
        try {
            // Initialize AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            // Standard US Ringtone frequencies: 440Hz + 480Hz
            const freq1 = 440;
            const freq2 = 480;

            const createOscillator = (freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                // Ringing pattern: 2s ON, 4s OFF
                const now = ctx.currentTime;
                // Loop a few times for the duration of a typical "wait"
                for (let i = 0; i < 10; i++) {
                    const startTime = now + (i * 6);
                    const endTime = startTime + 2;

                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1); // Fade in
                    gain.gain.linearRampToValueAtTime(0.1, endTime - 0.1);   // Sustain
                    gain.gain.linearRampToValueAtTime(0, endTime);           // Fade out
                }

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                return osc;
            };

            oscillatorsRef.current = [
                createOscillator(freq1),
                createOscillator(freq2)
            ];

        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    const stopRinging = () => {
        if (oscillatorsRef.current) {
            oscillatorsRef.current.forEach(osc => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch (e) { /* ignore */ }
            });
            oscillatorsRef.current = [];
        }

        if (audioContextRef.current) {
            audioContextRef.current.close().catch(e => console.error(e));
            audioContextRef.current = null;
        }
    };

    const handleEndCall = () => {
        stopRinging();
        onEndCall();
    };

    if (!isOpen || !contact) return null;

    return (
        <div className="call-modal-overlay">
            <div className="call-header">
                <div className="encrypted-text">
                    <Lock size={12} />
                    <span>End-to-end encrypted</span>
                </div>
            </div>

            <div className="call-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="call-avatar-container">
                    <div className="call-avatar">
                        {contact.name.charAt(0).toUpperCase()}
                    </div>
                </div>

                <h2 className="call-name">{contact.name}</h2>
                <p className="call-status">Ringing...</p>

                {/* Join Call Button for Caller */}
                {callUrl && (
                    <a
                        href={callUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-call-modal-btn"
                        onClick={handleEndCall} // Close modal on join
                    >
                        Join Call Now
                    </a>
                )}

                {/* Show Video Preview whenever video is ON (independent of initial call type) */}
                {/* Show Video Preview whenever video is ON (independent of initial call type) */}
                {(isVideoOn) && (
                    <div className="video-preview-container" style={{
                        width: '300px',
                        height: '200px',
                        backgroundColor: '#000',
                        marginTop: '20px',
                        borderRadius: '12px',
                        display: 'flex',
                        zIndex: 100
                    }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="video-preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}
            </div>

            <div className="call-footer">
                <button
                    className={`call-btn ${isSpeakerOn ? 'active' : ''}`}
                    title={isSpeakerOn ? "Turn Speaker Off" : "Turn Speaker On"}
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                    {isSpeakerOn ? <Volume2 size={24} /> : <Volume2 size={24} style={{ opacity: 0.5 }} />}
                </button>

                <button
                    className={`call-btn ${isVideoOn ? 'active' : ''}`}
                    title={!isVideoCall ? "Video disabled for Audio Call" : (isVideoOn ? "Turn Camera Off" : "Turn Camera On")}
                    onClick={() => isVideoCall && setIsVideoOn(!isVideoOn)}
                    disabled={!isVideoCall}
                    style={!isVideoCall ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                >
                    {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                <button
                    className={`call-btn ${isMuted ? 'active' : ''}`}
                    title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    className="end-call-btn"
                    onClick={handleEndCall}
                    title="End Call"
                >
                    <PhoneOff size={28} />
                </button>
            </div>
        </div>
    );
};

export default CallModal;
