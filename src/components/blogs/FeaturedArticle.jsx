import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
import { useHTMLContent } from "@/hooks/useHTMLContent"
import { Button } from "react-native-paper"
import { Badge } from "react-native-paper"
import { Clock, ArrowRight } from "lucide-react-native"
import Link from "next/link"


export default function FeaturedArticle({ article }) {
  const truncatedContent = useHTMLContent(article.content, { maxLength: 250 })
  return (
    <section style={styles.container}>
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.container}>
  <Image 
    src={article.image} 
    style={styles.container} 
    alt={article.title} 
  />
</View>

          <View style={styles.container}>

            <View style={styles.container}>
             
             

              <Text style={styles.container}>{article.title}</Text>

              <View style={styles.container}>{truncatedContent}</View>

              <View style={styles.container}>
                <View style={styles.container}>
                  <View style={styles.container}>
                    MDS
                  </View>
                  <div>
                    <View style={styles.container}>My Divine Stays Team</View>
                    <View style={styles.container}>{article.date}</View>
                  </View>
                </View>

               <Link to={{`/blogs/${article.slug}`}>
                <Button style={styles.container}>
                  Read More
                  <ArrowRight style={styles.container} />
                </Button></Link>
              </View>
            </View>
          </View>
        </View>
      </View>
    </section>
  )
}
