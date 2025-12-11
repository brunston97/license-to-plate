import os
import subprocess
import json

def process_images(folder_path):
    results = []
    for filename in os.listdir(folder_path):
        if filename.endswith((".jpg", ".jpeg", ".png")):  # Add more extensions if needed
            image_path = os.path.join(folder_path, filename)
            try:
                # Execute OpenALPR via command line
                command = ["./openalpr_64/alpr.exe", "--json", image_path]
                process = subprocess.run(command, capture_output=True, text=True, check=True)
                alpr_output = json.loads(process.stdout)
                #print(alpr_output)
                # Extract the top result
                if 'results' in alpr_output and alpr_output['results']:
                    top_result = alpr_output['results'][0]['plate']
                    results.append(top_result)
                else:
                    results.append(None) # Or handle no results differently
            except subprocess.CalledProcessError as e:
                print(f"Error processing {filename}: {e}")
                results.append(None)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from {filename}: {e}")
                results.append(None)

    return results

if __name__ == "__main__":
    folder_path = "images"  # Replace with your image folder
    results = process_images(folder_path)

    for i, result in enumerate(results):
        if result:
            #print(f"Image {i+1}: {result}")
            print(result)
        else:
            print(result)
            #print(f"Image {i+1}: No plate detected")