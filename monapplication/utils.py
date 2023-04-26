from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials

def get_image_tags(image_url):
    subscription_key = "5d95dc53ca4b47dcac0a33590375b684"
    endpoint = "https://visionimagesazure.cognitiveservices.azure.com/"
    
    computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))
    
    try:
        tags_result = computervision_client.tag_image(image_url)
        tags = [tag.name for tag in tags_result.tags]
    except Exception as e:
        print(f"Error getting tags for image: {e}")
        tags = []
    
    return tags

