package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	docker "github.com/fsouza/go-dockerclient"
	"github.com/gorilla/websocket"
)

type PtyReq struct {
	Input string `json:"input"`
}
type PtyRes struct {
	Output string `json:"output"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func startServer(dockerClient *docker.Client) {
	fmt.Println("Starting Websocket Server")
	http.HandleFunc("/websocket", func(w http.ResponseWriter, req *http.Request) {
		fmt.Printf("New Connection by %s\n", req.RemoteAddr)
		conn, err := upgrader.Upgrade(w, req, nil)
		if err != nil {
			fmt.Printf("Error upgrading connection: %s\n", err)
		}
		container, err := findContainer(dockerClient, "dfdb56bc0ce8a6ce2818f14fa21e8dc7e6bd17b4c9624ff532d8fa15d08ccf0f")
		if err != nil {
			fmt.Printf("Error finding container: %s\n", err)
			return
		}
		fmt.Printf("Container %s: \n\t%s\n\t%s\n", container.Status, container.ID, container.Image)
		var outStream bytes.Buffer
		var inStream bytes.Buffer
		exec, err := dockerClient.CreateExec(docker.CreateExecOptions{
			Container:    container.ID,
			AttachStdin:  true,
			AttachStdout: true,
			Cmd:          []string{"/bin/bash"},
			Tty:          true,
		})
		if err != nil {
			panic(err)
		}
		err = dockerClient.StartExec(exec.ID, docker.StartExecOptions{
			InputStream:  &inStream,
			OutputStream: &outStream,
			Tty:          true,
			RawTerminal:  true,
		})
		if err != nil {
			panic(err)
		}
		for {
			if outStream.Len() > 0 {
				fmt.Printf("outstream: %s\n", outStream.String())
				conn.WriteJSON(PtyRes{Output: outStream.String()})
				outStream.Reset()
			}
			// Read message from browser
			msgType, msg, err := conn.ReadMessage()
			if err != nil {
				return
			}
			var ptyIn PtyReq
			json.Unmarshal(msg, &ptyIn)
			fmt.Printf("recv from %s: %s\n", conn.RemoteAddr(), ptyIn.Input)
			inStream.WriteString(ptyIn.Input)
			var ptyOut PtyRes
			// ptyOut.Output = ptyIn.Input
			responseBytes, _ := json.Marshal(ptyOut)
			if err = conn.WriteMessage(msgType, responseBytes); err != nil {
				return
			}
		}
	})
	http.ListenAndServe(fmt.Sprintf(":%s", portOrOther("5000")), nil)
}

func findContainer(client *docker.Client, containerId string) (*docker.APIContainers, error) {
	containers, err := client.ListContainers(docker.ListContainersOptions{})
	if err != nil {
		panic(err)
	}
	for _, container := range containers {
		fmt.Printf("Container %s: \n\t%s\n\t%s\n", container.Status, container.ID, container.Image)
		if container.ID == containerId {
			return &container, nil
		}
	}
	return nil, fmt.Errorf("Container %s not found", containerId)
}

func portOrOther(port string) string {
	if os.Getenv("PORT") != "" {
		return os.Getenv("PORT")
	} else {
		return port
	}
}
