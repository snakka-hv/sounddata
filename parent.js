$(function() {
    $('#received_text').hide();
    $('#btnSend').click(function () {});

    $('#btnReceive').click(function () {
        $('#received_text').show();
    });

    /**
     * Convert a string to array buffer in UTF8
     * @function str2ab
     * @memberof Quiet
     * @param {string} s - string to be converted
     * @returns {ArrayBuffer} buf - converted arraybuffer
     */
    function str2ab(s) {
        var s_utf8 = unescape(encodeURIComponent(s));
        var buf = new ArrayBuffer(s_utf8.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0; i < s_utf8.length; i++) {
            bufView[i] = s_utf8.charCodeAt(i);
        }
        return buf;
    };


    /**
     * Convert text to bytearray - output will be binary value array (0's and 1s)
     * Run bytearray through crc32 for checksum safety - output will be a buffer padded bytearray
     * Convert crc32 padded byte array to audio signal using libquit native library - output is bytearray of audio stream
     * - Convert bytearray to audio byte array using javascript/browser native audio lib
     * - Convert audio byte array to needed frequency (~14Khz for audible, ~19Khz for Ultrasonic)
     * Play audio data through javascript/browser native library
     */
    function sendText(e) {
        var inputText = e.target.innerText;
        var arrayBuffer = Quiet.str2ab(payload);
        var crc32SafeValue = CRC32.bstr(arrayBuffer);
        var audibleAudioFreq = audioCtx.createJavaScriptNode(crc32SafeValue, "14");
        transmit.transmit(crc32SafeValue);

        var payload = textbox.value;
        if (payload === "") {
            onTransmitFinish();
            return;
        }
    }

    /**
     * Using javascript native audio libs, convert audio stream to bytearray based on profile (audible/ultrasonic)
     * Run bytearray through CRC32 checksum extracter - outputs bytearray buffer
     * Convert binary bytearray to text using Quiet lib
     * Output extracted text to html
     * @param e
     */
    function recieveText(e) {
        var inputAudioStream = e.target.value;
        var byteArrayWithoutCRC = CRC32.buf(inputAudioStream);
        var visibleText = Quiet.ab2str(byteArrayWithoutCRC);

        textbox.value(visibleText);
    }

    function domReady() {
        Quiet.receiver({profile: profilename,
            onReceive: recieveText,
            onCreateFail: onReceiverCreateFail,
            onReceiveFail: onReceiveFail
        });
    }


});

